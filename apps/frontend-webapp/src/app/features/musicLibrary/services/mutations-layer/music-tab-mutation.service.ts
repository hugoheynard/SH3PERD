import { inject, Injectable } from '@angular/core';
import { TabMutationService } from '../../../../shared/configurable-tab-bar';
import { MusicLibraryStateService } from '../music-library-state.service';
import { MusicTabQuotaChecker } from '../music-tab-quota-checker.service';
import type { MusicSearchConfig, MusicTabConfig } from '../../music-library-types';

const DEFAULT_MUSIC_CONFIG: () => MusicTabConfig = () => ({
  searchConfig: { searchMode: 'repertoire', target: { mode: 'me' }, dataFilterActive: false },
  searchQuery: '',
});

@Injectable({ providedIn: 'root' })
export class MusicTabMutationService
  extends TabMutationService<MusicTabConfig> {

  private readonly quota = inject(MusicTabQuotaChecker);

  constructor() {
    const state = inject(MusicLibraryStateService);
    super(state.tabState, DEFAULT_MUSIC_CONFIG, () => state.scheduleTabSave());
  }

  /* ── Service-level quota gates — defense-in-depth against UI drift ── */

  override addDefaultTab(): void {
    if (!this.quota.canAddTab()) return;
    super.addDefaultTab();
  }

  override saveTabConfig(name: string): void {
    if (!this.quota.canAddConfig()) return;
    super.saveTabConfig(name);
  }

  override moveActiveTabToConfig(tabId: string, targetConfigId: string): void {
    if (!this.quota.canMoveToConfig(targetConfigId)) return;
    super.moveActiveTabToConfig(tabId, targetConfigId);
  }

  override moveTabToConfig(sourceConfigId: string, targetConfigId: string, tabId: string): void {
    if (!this.quota.canMoveToConfig(targetConfigId)) return;
    super.moveTabToConfig(sourceConfigId, targetConfigId, tabId);
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
