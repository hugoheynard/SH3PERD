import { inject, Injectable } from '@angular/core';
import { PlaylistsStateService } from '../playlists-state.service';
import { PlaylistsApiService } from '../playlists-api.service';
import { ToastService } from '../../../../shared/toast/toast.service';
import type {
  PlaylistColor,
  TPlaylistSummaryViewModel,
} from '../../playlist-types';

@Injectable({ providedIn: 'root' })
export class PlaylistMutationService {
  private state = inject(PlaylistsStateService);
  private api = inject(PlaylistsApiService);
  private toast = inject(ToastService);

  /** Set the currently selected playlist. */
  selectPlaylist(id: string): void {
    this.state.updateState((state) => ({
      ...state,
      selectedPlaylistId: id,
    }));
  }

  /** Create a new playlist via the API and add it to state. */
  addPlaylist(name: string, color: PlaylistColor, description?: string): void {
    this.api.createPlaylist({ name, color, description }).subscribe({
      next: (created) => {
        // Empty playlist: no tracks, no duration, no ratings.
        // Aggregates will be refreshed from the backend on next load.
        const summary: TPlaylistSummaryViewModel = {
          id: created.id,
          name: created.name,
          description: created.description,
          color: created.color,
          createdAt: created.createdAt,
          trackCount: 0,
          totalDurationSeconds: 0,
          meanMastery: null,
          meanEnergy: null,
          meanEffort: null,
          meanQuality: null,
        };

        this.state.updateState((state) => ({
          ...state,
          playlists: [...state.playlists, summary],
          selectedPlaylistId: created.id,
        }));
      },
      error: () => {
        this.toast.show('Failed to create playlist', 'error');
      },
    });
  }

  /** Optimistic update of name, description, or color, then sync with API. */
  updatePlaylist(
    id: string,
    patch: Partial<
      Pick<TPlaylistSummaryViewModel, 'name' | 'description' | 'color'>
    >,
  ): void {
    // Capture previous state for rollback
    const previous = this.state.playlists().playlists;

    // Optimistic local update
    this.state.updateState((state) => ({
      ...state,
      playlists: state.playlists.map((pl) =>
        pl.id === id ? { ...pl, ...patch } : pl,
      ),
    }));

    this.api.updatePlaylist(id, patch).subscribe({
      error: () => {
        // Rollback
        this.state.updateState((state) => ({ ...state, playlists: previous }));
        this.toast.show('Failed to update playlist', 'error');
      },
    });
  }

  /**
   * Delete a playlist: remove from state immediately, then call API.
   * If the deleted playlist was selected, selects the first remaining one.
   */
  deletePlaylist(id: string): void {
    const previous = this.state.playlists();

    this.state.updateState((state) => {
      const remainingPlaylists = state.playlists.filter((pl) => pl.id !== id);
      const remainingTracks = state.tracks.filter((t) => t.playlistId !== id);

      let selectedPlaylistId = state.selectedPlaylistId;
      if (selectedPlaylistId === id) {
        selectedPlaylistId = remainingPlaylists[0]?.id ?? null;
      }

      return {
        ...state,
        playlists: remainingPlaylists,
        tracks: remainingTracks,
        selectedPlaylistId,
      };
    });

    this.api.deletePlaylist(id).subscribe({
      error: () => {
        // Rollback
        this.state.updateState(() => previous);
        this.toast.show('Failed to delete playlist', 'error');
      },
    });
  }
}
