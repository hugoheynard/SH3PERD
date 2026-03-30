import { inject, Injectable } from '@angular/core';
import { MusicLibraryStateService } from '../music-library-state.service';
import type { MusicSearchConfig, MusicTab, SavedTabConfig } from '../../music-library-types';

@Injectable({ providedIn: 'root' })
export class MusicTabMutationService {

  private state = inject(MusicLibraryStateService);

  /** Update state and schedule a debounced save to backend. */
  private updateAndSave(updater: (state: import('../../music-library-types').MusicLibraryState) => import('../../music-library-types').MusicLibraryState): void {
    this.state.updateState(updater);
    this.state.scheduleTabSave();
  }

  setActiveTab(id: string): void {
    this.updateAndSave(s => ({ ...s, activeTabId: id }));
  }

  addDefaultTab(): void {
    const tab: MusicTab = {
      id: crypto.randomUUID(),
      title: 'New Tab',
      autoTitle: true,
      searchQuery: '',
      searchConfig: { searchMode: 'repertoire', target: { mode: 'me' }, dataFilterActive: false },
    };
    this.updateAndSave(s => ({ ...s, tabs: [...s.tabs, tab], activeTabId: tab.id, activeConfigId: null }));
  }

  closeTab(id: string): void {
    this.updateAndSave(s => {
      const tabs = s.tabs.filter(t => t.id !== id);
      if (tabs.length === 0) return s;
      let activeTabId = s.activeTabId;
      if (activeTabId === id) {
        const idx = Math.min(s.tabs.findIndex(t => t.id === id), tabs.length - 1);
        activeTabId = tabs[idx].id;
      }
      return { ...s, tabs, activeTabId, activeConfigId: null };
    });
  }

  updateTabTitle(id: string, title: string): void {
    this.patchTab(id, t => ({ ...t, title, autoTitle: false }));
  }

  updateTabSearchConfig(id: string, config: MusicSearchConfig): void {
    this.patchTab(id, t => ({ ...t, searchConfig: config }));
  }

  toggleDataFilter(id: string): void {
    this.patchTab(id, t => ({
      ...t,
      searchConfig: { ...t.searchConfig, dataFilterActive: !t.searchConfig.dataFilterActive },
    }));
  }

  patchDataFilter(id: string, patch: Partial<NonNullable<MusicSearchConfig['dataFilter']>>): void {
    this.patchTab(id, t => ({
      ...t,
      searchConfig: { ...t.searchConfig, dataFilter: { ...t.searchConfig.dataFilter, ...patch } },
    }));
  }

  setSearchQuery(tabId: string, query: string): void {
    this.patchTab(tabId, t => ({ ...t, searchQuery: query }));
  }

  setTabColor(id: string, color: string): void {
    this.patchTab(id, t => ({ ...t, color: color || undefined }));
  }

  reorderTab(tabId: string, newIndex: number): void {
    this.updateAndSave(s => {
      const tabs = [...s.tabs];
      const oldIdx = tabs.findIndex(t => t.id === tabId);
      if (oldIdx === -1 || oldIdx === newIndex) return s;
      const [tab] = tabs.splice(oldIdx, 1);
      tabs.splice(newIndex, 0, tab);
      return { ...s, tabs };
    });
  }

  saveTabConfig(name: string): void {
    const s = this.state.snapshot();
    const config: SavedTabConfig = {
      id: crypto.randomUUID(),
      name,
      tabs: [...s.tabs],
      activeTabId: s.activeTabId,
      createdAt: Date.now(),
    };
    this.updateAndSave(st => ({ ...st, savedTabConfigs: [...(st.savedTabConfigs ?? []), config] }));
  }

  deleteTabConfig(id: string): void {
    this.updateAndSave(s => ({ ...s, savedTabConfigs: (s.savedTabConfigs ?? []).filter(c => c.id !== id) }));
  }

  renameTabConfig(configId: string, name: string): void {
    this.patchSavedConfig(configId, c => ({ ...c, name }));
  }

  removeTabFromConfig(configId: string, tabId: string): void {
    this.patchSavedConfig(configId, c => {
      const tabs = c.tabs.filter(t => t.id !== tabId);
      if (tabs.length === 0) return c; // don't allow empty configs
      const activeTabId = c.activeTabId === tabId ? tabs[0].id : c.activeTabId;
      return { ...c, tabs, activeTabId };
    });
  }

  renameTabInConfig(configId: string, tabId: string, title: string): void {
    this.patchSavedConfig(configId, c => ({
      ...c,
      tabs: c.tabs.map(t => t.id === tabId ? { ...t, title, autoTitle: false } : t),
    }));
  }

  moveTabToConfig(sourceConfigId: string, targetConfigId: string, tabId: string): void {
    this.updateAndSave(s => {
      const configs = [...(s.savedTabConfigs ?? [])];
      const srcIdx = configs.findIndex(c => c.id === sourceConfigId);
      const tgtIdx = configs.findIndex(c => c.id === targetConfigId);
      if (srcIdx === -1 || tgtIdx === -1) return s;

      const src = configs[srcIdx];
      const tab = src.tabs.find(t => t.id === tabId);
      if (!tab) return s;

      // Remove from source (don't allow empty)
      const srcTabs = src.tabs.filter(t => t.id !== tabId);
      if (srcTabs.length === 0) return s;

      configs[srcIdx] = {
        ...src,
        tabs: srcTabs,
        activeTabId: src.activeTabId === tabId ? srcTabs[0].id : src.activeTabId,
      };
      configs[tgtIdx] = {
        ...configs[tgtIdx],
        tabs: [...configs[tgtIdx].tabs, tab],
      };

      return { ...s, savedTabConfigs: configs };
    });
  }

  addActiveTabToConfig(tab: MusicTab, targetConfigId: string): void {
    const savedTab = { ...tab };
    this.patchSavedConfig(targetConfigId, c => ({
      ...c,
      tabs: [...c.tabs, savedTab],
    }));
  }

  private patchSavedConfig(configId: string, updater: (cfg: SavedTabConfig) => SavedTabConfig): void {
    this.updateAndSave(s => ({
      ...s,
      savedTabConfigs: (s.savedTabConfigs ?? []).map(c => c.id === configId ? updater(c) : c),
    }));
  }

  applyTabConfig(config: SavedTabConfig): void {
    const restoredTabs = config.tabs.map(t => ({ ...t, searchQuery: t.searchQuery ?? '' }));
    this.updateAndSave(s => ({
      ...s,
      tabs: restoredTabs,
      activeTabId: config.activeTabId,
      activeConfigId: config.id,
    }));
  }

  newConfig(): void {
    const tab: MusicTab = {
      id: crypto.randomUUID(),
      title: 'New Tab',
      autoTitle: true,
      searchQuery: '',
      searchConfig: { searchMode: 'repertoire', target: { mode: 'me' }, dataFilterActive: false },
    };
    this.updateAndSave(s => ({
      ...s,
      tabs: [tab],
      activeTabId: tab.id,
      activeConfigId: null,
    }));
  }

  private patchTab(id: string, updater: (tab: MusicTab) => MusicTab): void {
    this.updateAndSave(s => ({
      ...s,
      tabs: s.tabs.map(t => t.id === id ? updater(t) : t),
    }));
  }
}
