import { computed, Injectable, signal } from '@angular/core';
import type { MusicLibraryState } from '../music-library-types';
import { MOCK_REFERENCES, MOCK_REPERTOIRE, MOCK_VERSIONS, MOCK_TABS, mockCrossContext } from '../utils/mock-music-data';

@Injectable({ providedIn: 'root' })
export class MusicLibraryStateService {

  private state = signal<MusicLibraryState>({
    references: MOCK_REFERENCES,
    repertoire: MOCK_REPERTOIRE,
    versions: MOCK_VERSIONS,
    tabs: MOCK_TABS,
    activeTabId: 'repertoire_me',
    searchQuery: '',
    savedTabConfigs: [],
    crossContext: mockCrossContext,
  });

  readonly library = computed(() => this.state());

  updateState(updater: (state: MusicLibraryState) => MusicLibraryState): void {
    this.state.update(updater);
  }
}
