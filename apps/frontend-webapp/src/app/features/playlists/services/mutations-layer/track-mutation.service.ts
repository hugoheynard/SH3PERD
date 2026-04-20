import { inject, Injectable } from '@angular/core';
import { PlaylistsStateService } from '../playlists-state.service';
import { PlaylistsApiService } from '../playlists-api.service';
import { ToastService } from '../../../../shared/toast/toast.service';
import type {
  TMusicReferenceId,
  TMusicVersionId,
} from '@sh3pherd/shared-types';

@Injectable({ providedIn: 'root' })
export class TrackMutationService {
  private state = inject(PlaylistsStateService);
  private api = inject(PlaylistsApiService);
  private toast = inject(ToastService);

  /**
   * Add a new track to the given playlist via the API.
   * The returned track is appended to state.
   */
  addTrack(
    playlistId: string,
    referenceId: TMusicReferenceId,
    versionId: TMusicVersionId,
    notes?: string,
  ): void {
    this.api.addTrack(playlistId, { referenceId, versionId, notes }).subscribe({
      next: (track) => {
        this.state.updateState((state) => ({
          ...state,
          tracks: [...state.tracks, track],
          // Bump trackCount on the summary
          playlists: state.playlists.map((pl) =>
            pl.id === playlistId
              ? { ...pl, trackCount: pl.trackCount + 1 }
              : pl,
          ),
        }));
      },
      error: () => {
        this.toast.show('Failed to add track', 'error');
      },
    });
  }

  /** Remove a track from a playlist: optimistic remove, then API call. */
  removeTrack(playlistId: string, trackId: string): void {
    const previousTracks = this.state.playlists().tracks;
    const previousPlaylists = this.state.playlists().playlists;

    this.state.updateState((state) => ({
      ...state,
      tracks: state.tracks.filter((t) => t.id !== trackId),
      playlists: state.playlists.map((pl) =>
        pl.id === playlistId
          ? { ...pl, trackCount: Math.max(0, pl.trackCount - 1) }
          : pl,
      ),
    }));

    this.api.removeTrack(playlistId, trackId).subscribe({
      error: () => {
        // Rollback
        this.state.updateState((state) => ({
          ...state,
          tracks: previousTracks,
          playlists: previousPlaylists,
        }));
        this.toast.show('Failed to remove track', 'error');
      },
    });
  }

  /**
   * Move a track to a new position inside a playlist.
   *
   * `playlistId` is passed explicitly so the API call fires
   * unconditionally — the optimistic update on `state.tracks` is a
   * best-effort that no-ops when the flat-tracks slice isn't
   * populated (the new detail component holds its own resolved
   * tracklist signal; `state.tracks` stays empty unless some other
   * caller wires it in). On backend error we roll back `state.tracks`
   * and surface a toast; callers that paint their own optimistic UI
   * (detail view, summary series) are responsible for their own
   * rollback.
   */
  moveTrack(playlistId: string, trackId: string, newPosition: number): void {
    const previousTracks = this.state.playlists().tracks;

    this.state.updateState((state) => {
      const track = state.tracks.find((t) => t.id === trackId);
      if (!track) return state;

      const siblings = state.tracks
        .filter((t) => t.playlistId === track.playlistId && t.id !== trackId)
        .sort((a, b) => a.position - b.position);

      const clamped = Math.max(0, Math.min(newPosition, siblings.length));

      const before = siblings.slice(0, clamped);
      const after = siblings.slice(clamped);
      const reordered = [...before, { ...track, position: clamped }, ...after];

      const renumbered = reordered.map((t, i) => ({ ...t, position: i }));

      const otherTracks = state.tracks.filter(
        (t) => t.playlistId !== track.playlistId,
      );

      return {
        ...state,
        tracks: [...otherTracks, ...renumbered],
      };
    });

    this.api.reorderTrack(playlistId, trackId, { newPosition }).subscribe({
      error: () => {
        this.state.updateState((state) => ({
          ...state,
          tracks: previousTracks,
        }));
        this.toast.show('Failed to reorder track', 'error');
      },
    });
  }
}
