import { computed, inject, Injectable } from '@angular/core';
import { PlaylistsStateService } from '../playlists-state.service';
import type { TPlaylistSummaryViewModel } from '../../playlist-types';

@Injectable({ providedIn: 'root' })
export class PlaylistSelectorService {

  private state = inject(PlaylistsStateService);

  /** All playlists. */
  playlists = computed(() => this.state.playlists().playlists);

  /** Map of playlist ID to Playlist for O(1) lookup. */
  playlistsById = computed(() => {
    const map = new Map<string, TPlaylistSummaryViewModel>();
    for (const pl of this.playlists()) {
      map.set(pl.id, pl);
    }
    return map;
  });

  /** The currently selected playlist ID. */
  selectedPlaylistId = computed(() => this.state.playlists().selectedPlaylistId);

  /** The selected Playlist object, or null if none selected. */
  selectedPlaylist = computed((): TPlaylistSummaryViewModel | null => {
    const id = this.selectedPlaylistId();
    if (!id) return null;
    return this.playlistsById().get(id) ?? null;
  });
}
