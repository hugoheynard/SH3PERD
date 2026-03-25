import { computed, Injectable, signal } from '@angular/core';
import type { PlaylistsState } from '../playlist-types';
import { MOCK_PLAYLISTS, MOCK_PLAYLIST_TRACKS } from '../utils/mock-playlists-data';

@Injectable({ providedIn: 'root' })
export class PlaylistsStateService {

  private state = signal<PlaylistsState>({
    playlists: MOCK_PLAYLISTS,
    tracks: MOCK_PLAYLIST_TRACKS,
    selectedPlaylistId: MOCK_PLAYLISTS[0]?.id ?? null,
  });

  readonly playlists = computed(() => this.state());

  updateState(updater: (state: PlaylistsState) => PlaylistsState): void {
    this.state.update(updater);
  }
}
