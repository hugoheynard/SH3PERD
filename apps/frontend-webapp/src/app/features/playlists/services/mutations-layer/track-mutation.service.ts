import { inject, Injectable } from '@angular/core';
import { PlaylistsStateService } from '../playlists-state.service';
import type { PlaylistTrack } from '../../playlist-types';

@Injectable({ providedIn: 'root' })
export class TrackMutationService {

  private state = inject(PlaylistsStateService);

  /**
   * Add a new track to the given playlist.
   * The track is appended at the end (position = current max + 1).
   */
  addTrack(playlistId: string, referenceId: string, versionId?: string): void {
    this.state.updateState(state => {
      const playlistTracks = state.tracks.filter(t => t.playlistId === playlistId);
      const maxPosition = playlistTracks.reduce((max, t) => Math.max(max, t.position), 0);

      const newTrack: PlaylistTrack = {
        id: crypto.randomUUID(),
        playlistId,
        referenceId,
        versionId,
        position: maxPosition + 1,
      };

      return {
        ...state,
        tracks: [...state.tracks, newTrack],
      };
    });
  }

  /** Remove a track from a playlist by its ID. */
  removeTrack(trackId: string): void {
    this.state.updateState(state => ({
      ...state,
      tracks: state.tracks.filter(t => t.id !== trackId),
    }));
  }

  /**
   * Move a track to a new position within its playlist.
   * Reorders all sibling tracks to maintain a contiguous 1-based sequence.
   */
  moveTrack(trackId: string, newPosition: number): void {
    this.state.updateState(state => {
      const track = state.tracks.find(t => t.id === trackId);
      if (!track) return state;

      const siblings = state.tracks
        .filter(t => t.playlistId === track.playlistId && t.id !== trackId)
        .sort((a, b) => a.position - b.position);

      // Clamp newPosition to valid range
      const clamped = Math.max(1, Math.min(newPosition, siblings.length + 1));

      // Insert the moved track at the clamped position among siblings
      const before = siblings.slice(0, clamped - 1);
      const after = siblings.slice(clamped - 1);
      const reordered = [...before, { ...track, position: clamped }, ...after];

      // Re-assign 1-based positions
      const renumbered = reordered.map((t, i) => ({ ...t, position: i + 1 }));

      const otherTracks = state.tracks.filter(t => t.playlistId !== track.playlistId);

      return {
        ...state,
        tracks: [...otherTracks, ...renumbered],
      };
    });
  }
}
