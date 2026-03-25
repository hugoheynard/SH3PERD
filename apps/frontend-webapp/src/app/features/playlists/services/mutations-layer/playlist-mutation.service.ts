import { inject, Injectable } from '@angular/core';
import { PlaylistsStateService } from '../playlists-state.service';
import type { Playlist, PlaylistColor } from '../../playlist-types';

@Injectable({ providedIn: 'root' })
export class PlaylistMutationService {

  private state = inject(PlaylistsStateService);

  /** Set the currently selected playlist. */
  selectPlaylist(id: string): void {
    this.state.updateState(state => ({
      ...state,
      selectedPlaylistId: id,
    }));
  }

  /** Add a new playlist with the given name, color, and optional description. */
  addPlaylist(name: string, color: PlaylistColor, description?: string): void {
    const newPlaylist: Playlist = {
      id: crypto.randomUUID(),
      name,
      color,
      description,
      createdAt: new Date().toISOString(),
    };

    this.state.updateState(state => ({
      ...state,
      playlists: [...state.playlists, newPlaylist],
      selectedPlaylistId: newPlaylist.id,
    }));
  }

  /** Update name, description, or color of an existing playlist. */
  updatePlaylist(
    id: string,
    patch: Partial<Pick<Playlist, 'name' | 'description' | 'color'>>
  ): void {
    this.state.updateState(state => ({
      ...state,
      playlists: state.playlists.map(pl =>
        pl.id === id ? { ...pl, ...patch } : pl
      ),
    }));
  }

  /**
   * Delete a playlist and all its associated tracks from state.
   * If the deleted playlist was selected, clears the selection.
   */
  deletePlaylist(id: string): void {
    this.state.updateState(state => {
      const remainingPlaylists = state.playlists.filter(pl => pl.id !== id);
      const remainingTracks = state.tracks.filter(t => t.playlistId !== id);

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
  }
}
