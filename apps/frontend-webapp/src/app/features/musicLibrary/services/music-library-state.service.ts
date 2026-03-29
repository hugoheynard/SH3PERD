import { computed, Injectable, signal } from '@angular/core';
import type { MusicLibraryState } from '../music-library-types';
import { MOCK_ENTRIES, MOCK_TABS, mockCrossContext } from '../utils/mock-music-data';

@Injectable({ providedIn: 'root' })
export class MusicLibraryStateService {

  private state = signal<MusicLibraryState>({
    entries: MOCK_ENTRIES,
    tabs: MOCK_TABS,
    activeTabId: 'repertoire_me',
    savedTabConfigs: [],
    crossContext: mockCrossContext,
  });

  readonly library = computed(() => this.state());

  updateState(updater: (state: MusicLibraryState) => MusicLibraryState): void {
    this.state.update(updater);
  }
}
