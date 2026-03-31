import { inject, Injectable } from '@angular/core';
import { MusicLibraryStateService } from '../music-library-state.service';
import { TabMutationService } from '../../../../shared/configurable-tab-bar';
import type { MusicSearchConfig, MusicTabConfig } from '../../music-library-types';

const DEFAULT_MUSIC_CONFIG: () => MusicTabConfig = () => ({
  searchConfig: { searchMode: 'repertoire', target: { mode: 'me' }, dataFilterActive: false },
  searchQuery: '',
});

@Injectable({ providedIn: 'root' })
export class MusicTabMutationService
  extends TabMutationService<MusicTabConfig> {

  constructor() {
    const state = inject(MusicLibraryStateService);
    super(state.tabState, DEFAULT_MUSIC_CONFIG, () => state.scheduleTabSave());
  }

  /* ── Music-specific mutations ──────────────────── */

  updateTabSearchConfig(id: string, config: MusicSearchConfig): void {
    this.patchTabConfig(id, c => ({ ...c, searchConfig: config }));
  }

  toggleDataFilter(id: string): void {
    this.patchTabConfig(id, c => ({
      ...c,
      searchConfig: { ...c.searchConfig, dataFilterActive: !c.searchConfig.dataFilterActive },
    }));
  }

  patchDataFilter(id: string, patch: Partial<NonNullable<MusicSearchConfig['dataFilter']>>): void {
    this.patchTabConfig(id, c => ({
      ...c,
      searchConfig: { ...c.searchConfig, dataFilter: { ...c.searchConfig.dataFilter, ...patch } },
    }));
  }

  setSearchQuery(tabId: string, query: string): void {
    this.patchTabConfig(tabId, c => ({ ...c, searchQuery: query }));
  }
}
