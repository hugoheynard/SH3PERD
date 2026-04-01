import { computed, inject, Injectable, signal } from '@angular/core';
import type { PlaylistsState } from '../playlist-types';
import { PlaylistsApiService } from './playlists-api.service';
import { ToastService } from '../../../shared/toast/toast.service';

@Injectable({ providedIn: 'root' })
export class PlaylistsStateService {

  private readonly api = inject(PlaylistsApiService);
  private readonly toast = inject(ToastService);

  private state = signal<PlaylistsState>({
    playlists: [],
    tracks: [],
    selectedPlaylistId: null,
  });

  private loaded = false;

  readonly playlists = computed(() => this.state());

  /** Fetch user's playlists from the backend. Idempotent — only fires once. */
  loadPlaylists(): void {
    if (this.loaded) return;
    this.loaded = true;

    this.api.getMyPlaylists().subscribe({
      next: (summaries) => {
        this.state.update(s => ({
          ...s,
          playlists: summaries,
          selectedPlaylistId: s.selectedPlaylistId ?? summaries[0]?.id ?? null,
        }));
      },
      error: (err) => {
        console.error('[PlaylistsState] Failed to load playlists', err);
        this.toast.show('Failed to load playlists', 'error');
        this.loaded = false;
      },
    });
  }

  /** Force a reload on next loadPlaylists() call. */
  invalidate(): void {
    this.loaded = false;
  }

  updateState(updater: (state: PlaylistsState) => PlaylistsState): void {
    this.state.update(updater);
  }
}
