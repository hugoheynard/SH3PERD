import { inject, Injectable } from '@angular/core';
import { MusicLibraryStateService } from '../music-library-state.service';
import { TabMutationService } from '../../../../shared/configurable-tab-bar';
import type { MusicSearchConfig, MusicTabConfig, SavedTabConfig } from '../../music-library-types';

const DEFAULT_MUSIC_CONFIG: () => MusicTabConfig = () => ({
  searchConfig: { searchMode: 'repertoire', target: { mode: 'me' }, dataFilterActive: false },
  searchQuery: '',
});

@Injectable({ providedIn: 'root' })
export class MusicTabMutationService {

  private state = inject(MusicLibraryStateService);
  private generic!: TabMutationService<MusicTabConfig>;

  /** Must be called once after state service is initialized */
  init(): void {
    this.generic = new TabMutationService<MusicTabConfig>(
      this.state.tabStateAccessor,
      DEFAULT_MUSIC_CONFIG,
      () => this.state.scheduleTabSave(),
    );
  }

  /* ── Delegated generic operations ──────────────── */

  setActiveTab(id: string): void { this.generic.setActiveTab(id); }
  addDefaultTab(): void { this.generic.addDefaultTab(); }
  closeTab(id: string): void { this.generic.closeTab(id); }
  updateTabTitle(id: string, title: string): void { this.generic.updateTabTitle(id, title); }
  setTabColor(id: string, color: string): void { this.generic.setTabColor(id, color); }
  reorderTab(tabId: string, newIndex: number): void { this.generic.reorderTab(tabId, newIndex); }
  saveTabConfig(name: string): void { this.generic.saveTabConfig(name); }
  deleteTabConfig(id: string): void { this.generic.deleteTabConfig(id); }
  renameTabConfig(configId: string, name: string): void { this.generic.renameTabConfig(configId, name); }
  removeTabFromConfig(configId: string, tabId: string): void { this.generic.removeTabFromConfig(configId, tabId); }
  renameTabInConfig(configId: string, tabId: string, title: string): void { this.generic.renameTabInConfig(configId, tabId, title); }
  moveTabToConfig(sourceConfigId: string, targetConfigId: string, tabId: string): void { this.generic.moveTabToConfig(sourceConfigId, targetConfigId, tabId); }
  moveActiveTabToConfig(tabId: string, targetConfigId: string): void { this.generic.moveActiveTabToConfig(tabId, targetConfigId); }
  applyTabConfig(config: SavedTabConfig): void { this.generic.applyTabConfig(config); }
  newConfig(): void { this.generic.newConfig(); }

  /* ── Music-specific mutations ──────────────────── */

  updateTabSearchConfig(id: string, config: MusicSearchConfig): void {
    this.generic.patchTabConfig(id, c => ({ ...c, searchConfig: config }));
  }

  toggleDataFilter(id: string): void {
    this.generic.patchTabConfig(id, c => ({
      ...c,
      searchConfig: { ...c.searchConfig, dataFilterActive: !c.searchConfig.dataFilterActive },
    }));
  }

  patchDataFilter(id: string, patch: Partial<NonNullable<MusicSearchConfig['dataFilter']>>): void {
    this.generic.patchTabConfig(id, c => ({
      ...c,
      searchConfig: { ...c.searchConfig, dataFilter: { ...c.searchConfig.dataFilter, ...patch } },
    }));
  }

  setSearchQuery(tabId: string, query: string): void {
    this.generic.patchTabConfig(tabId, c => ({ ...c, searchQuery: query }));
  }
}
