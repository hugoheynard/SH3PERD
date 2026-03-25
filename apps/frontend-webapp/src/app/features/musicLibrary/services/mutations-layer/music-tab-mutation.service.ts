import { Injectable } from '@angular/core';
import { BaseMusicItemCRUD } from './BaseMusicItemCRUD';
import type { MusicSearchConfig, MusicTab } from '../../music-library-types';

@Injectable({ providedIn: 'root' })
export class MusicTabMutationService extends BaseMusicItemCRUD<'tabs'> {

  constructor() {
    super('tabs');
  }

  protected createDefault(_input: unknown): MusicTab {
    return {
      id: crypto.randomUUID(),
      title: 'New Tab',
      autoTitle: true,
      searchConfig: {
        searchMode: 'repertoire',
        target: { mode: 'me' },
        dataFilterActive: false,
      },
    };
  }

  /**
   * Sets the active tab by ID.
   */
  setActiveTab(id: string): void {
    this.state.updateState(state => ({
      ...state,
      activeTabId: id,
    }));
  }

  /**
   * Adds a new default tab and sets it as active.
   */
  addDefaultTab(): void {
    const newTab: MusicTab = {
      id: crypto.randomUUID(),
      title: 'New Tab',
      autoTitle: true,
      searchConfig: {
        searchMode: 'repertoire',
        target: { mode: 'me' },
        dataFilterActive: false,
      },
    };

    this.state.updateState(state => ({
      ...state,
      tabs: [...state.tabs, newTab],
      activeTabId: newTab.id,
    }));
  }

  /**
   * Updates the title of a tab and disables auto-titling.
   */
  updateTabTitle(id: string, title: string): void {
    this.patch(id, item => ({
      ...item,
      title,
      autoTitle: false,
    } as MusicTab));
  }

  /**
   * Updates the search configuration of a tab.
   */
  updateTabSearchConfig(id: string, config: MusicSearchConfig): void {
    this.patch(id, item => ({
      ...item,
      searchConfig: config,
    } as MusicTab));
  }

  /**
   * Toggles dataFilterActive on the given tab.
   */
  toggleDataFilter(id: string): void {
    this.patch(id, item => ({
      ...item,
      searchConfig: {
        ...item.searchConfig,
        dataFilterActive: !item.searchConfig.dataFilterActive,
      },
    } as MusicTab));
  }

  /**
   * Updates the dataFilter on the given tab.
   * Accepts a partial patch — only provided keys are updated.
   */
  patchDataFilter(id: string, patch: Partial<NonNullable<MusicSearchConfig['dataFilter']>>): void {
    this.patch(id, item => ({
      ...item,
      searchConfig: {
        ...item.searchConfig,
        dataFilter: {
          ...item.searchConfig.dataFilter,
          ...patch,
        },
      },
    } as MusicTab));
  }

  /**
   * Closes a tab. If it was active, activates the adjacent tab.
   */
  closeTab(id: string): void {
    this.state.updateState(state => {
      const tabs = state.tabs.filter(t => t.id !== id);

      if (tabs.length === 0) {
        // Keep at least one tab
        return state;
      }

      let activeTabId = state.activeTabId;

      if (activeTabId === id) {
        const removedIndex = state.tabs.findIndex(t => t.id === id);
        const newIndex = Math.min(removedIndex, tabs.length - 1);
        activeTabId = tabs[newIndex].id;
      }

      return { ...state, tabs, activeTabId };
    });
  }
}
