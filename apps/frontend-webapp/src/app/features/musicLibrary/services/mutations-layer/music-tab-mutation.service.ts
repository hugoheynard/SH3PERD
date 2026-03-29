import { inject, Injectable } from '@angular/core';
import { MusicLibraryStateService } from '../music-library-state.service';
import type { MusicSearchConfig, MusicTab, SavedTabConfig } from '../../music-library-types';

@Injectable({ providedIn: 'root' })
export class MusicTabMutationService {

  private state = inject(MusicLibraryStateService);

  setActiveTab(id: string): void {
    this.state.updateState(s => ({ ...s, activeTabId: id }));
  }

  addDefaultTab(): void {
    const tab: MusicTab = {
      id: crypto.randomUUID(),
      title: 'New Tab',
      autoTitle: true,
      searchQuery: '',
      searchConfig: { searchMode: 'repertoire', target: { mode: 'me' }, dataFilterActive: false },
    };
    this.state.updateState(s => ({ ...s, tabs: [...s.tabs, tab], activeTabId: tab.id }));
  }

  closeTab(id: string): void {
    this.state.updateState(s => {
      const tabs = s.tabs.filter(t => t.id !== id);
      if (tabs.length === 0) return s;
      let activeTabId = s.activeTabId;
      if (activeTabId === id) {
        const idx = Math.min(s.tabs.findIndex(t => t.id === id), tabs.length - 1);
        activeTabId = tabs[idx].id;
      }
      return { ...s, tabs, activeTabId };
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
    this.state.updateState(s => {
      const tabs = [...s.tabs];
      const oldIdx = tabs.findIndex(t => t.id === tabId);
      if (oldIdx === -1 || oldIdx === newIndex) return s;
      const [tab] = tabs.splice(oldIdx, 1);
      tabs.splice(newIndex, 0, tab);
      return { ...s, tabs };
    });
  }

  saveTabConfig(name: string, searchConfig: MusicSearchConfig): void {
    const config: SavedTabConfig = { id: crypto.randomUUID(), name, searchConfig, createdAt: Date.now() };
    this.state.updateState(s => ({ ...s, savedTabConfigs: [...(s.savedTabConfigs ?? []), config] }));
  }

  deleteTabConfig(id: string): void {
    this.state.updateState(s => ({ ...s, savedTabConfigs: (s.savedTabConfigs ?? []).filter(c => c.id !== id) }));
  }

  applyTabConfig(tabId: string, searchConfig: MusicSearchConfig): void {
    this.patchTab(tabId, t => ({ ...t, searchConfig, autoTitle: false }));
  }

  private patchTab(id: string, updater: (tab: MusicTab) => MusicTab): void {
    this.state.updateState(s => ({
      ...s,
      tabs: s.tabs.map(t => t.id === id ? updater(t) : t),
    }));
  }
}
