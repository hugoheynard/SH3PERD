import { computed, inject, Injectable, signal } from '@angular/core';
import type { MusicLibraryState, LibraryEntry } from '../music-library-types';
import { MOCK_TABS, mockCrossContext } from '../utils/mock-music-data';
import { MusicLibraryApiService } from './music-library-api.service';

@Injectable({ providedIn: 'root' })
export class MusicLibraryStateService {

  private readonly libraryApi = inject(MusicLibraryApiService);

  private state = signal<MusicLibraryState>({
    entries: [],
    tabs: MOCK_TABS,
    activeTabId: 'repertoire_me',
    savedTabConfigs: [],
    crossContext: mockCrossContext,
  });

  private loaded = false;

  readonly library = computed(() => this.state());

  /**
   * Load the user's library from the backend.
   * Called once on first access (e.g. from the music library page).
   */
  loadLibrary(): void {
    if (this.loaded) return;
    this.loaded = true;

    this.libraryApi.getMyLibrary().subscribe({
      next: (result) => {
        this.state.update(s => ({
          ...s,
          entries: result.entries as LibraryEntry[],
        }));
      },
      error: (err) => {
        console.error('[MusicLibraryState] Failed to load library', err);
        this.loaded = false; // allow retry
      },
    });
  }

  updateState(updater: (state: MusicLibraryState) => MusicLibraryState): void {
    this.state.update(updater);
  }
}
