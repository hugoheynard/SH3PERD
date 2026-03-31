import type { TabItem, SavedTabConfig, TabSystemState, TabStateSignal } from './configurable-tab-bar.types';

/**
 * Abstract tab mutation service — extend with domain-specific mutations.
 *
 * Usage:
 * ```
 * @Injectable()
 * class MyTabService extends TabMutationService<MyConfig> {
 *   constructor() {
 *     const state = inject(MyStateService);
 *     super(state.tabState, () => DEFAULT, () => state.scheduleTabSave());
 *   }
 *   // domain-specific mutations using this.patchTabConfig()
 * }
 * ```
 */
export abstract class TabMutationService<TConfig> {

  constructor(
    protected state: TabStateSignal<TConfig>,
    protected defaultConfigFactory: () => TConfig,
    protected onChanged: () => void,
  ) {}

  protected snapshot(): TabSystemState<TConfig> {
    return this.state();
  }

  protected update(updater: (s: TabSystemState<TConfig>) => TabSystemState<TConfig>): void {
    this.state.update(s => {
      const updated = updater(s);
      return this.syncActiveConfig(updated);
    });
    this.onChanged();
  }

  /** Keep the active saved config in sync with the current tabs */
  private syncActiveConfig(s: TabSystemState<TConfig>): TabSystemState<TConfig> {
    if (!s.activeConfigId) return s;
    const savedConfigs = (s.savedTabConfigs ?? []).map(c => {
      if (c.id !== s.activeConfigId) return c;
      return { ...c, tabs: s.tabs.map(t => ({ ...t })), activeTabId: s.activeTabId };
    });
    return { ...s, savedTabConfigs: savedConfigs };
  }

  /* ── Tab CRUD ─────────────────────────────────── */

  setActiveTab(id: string): void {
    this.update(s => ({ ...s, activeTabId: id }));
  }

  addDefaultTab(): void {
    const tab: TabItem<TConfig> = {
      id: crypto.randomUUID(),
      title: 'New Tab',
      autoTitle: true,
      config: this.defaultConfigFactory(),
    };
    this.update(s => ({ ...s, tabs: [...s.tabs, tab], activeTabId: tab.id }));
  }

  closeTab(id: string): void {
    this.update(s => {
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

  setTabColor(id: string, color: string): void {
    this.patchTab(id, t => ({ ...t, color: color || undefined }));
  }

  reorderTab(tabId: string, newIndex: number): void {
    this.update(s => {
      const tabs = [...s.tabs];
      const oldIdx = tabs.findIndex(t => t.id === tabId);
      if (oldIdx === -1 || oldIdx === newIndex) return s;
      const [tab] = tabs.splice(oldIdx, 1);
      tabs.splice(newIndex, 0, tab);
      return { ...s, tabs };
    });
  }

  /* ── Domain-specific config mutation ──────────── */

  patchTabConfig(id: string, updater: (config: TConfig) => TConfig): void {
    this.patchTab(id, t => ({ ...t, config: updater(t.config) }));
  }

  /* ── Saved configs ────────────────────────────── */

  saveTabConfig(name: string): void {
    const s = this.snapshot();
    const savedTabs = s.tabs.map(t => ({ ...t }));
    const config: SavedTabConfig<TConfig> = {
      id: crypto.randomUUID(),
      name,
      tabs: savedTabs,
      activeTabId: s.activeTabId,
      createdAt: Date.now(),
    };
    this.update(st => ({
      ...st,
      savedTabConfigs: [...(st.savedTabConfigs ?? []), config],
      activeConfigId: config.id,
    }));
  }

  deleteTabConfig(id: string): void {
    this.update(s => ({
      ...s,
      savedTabConfigs: (s.savedTabConfigs ?? []).filter(c => c.id !== id),
      activeConfigId: s.activeConfigId === id ? null : s.activeConfigId,
    }));
  }

  renameTabConfig(configId: string, name: string): void {
    this.patchSavedConfig(configId, c => ({ ...c, name }));
  }

  removeTabFromConfig(configId: string, tabId: string): void {
    this.patchSavedConfig(configId, c => {
      const tabs = c.tabs.filter(t => t.id !== tabId);
      if (tabs.length === 0) return c;
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
    this.update(s => {
      const configs = [...(s.savedTabConfigs ?? [])];
      const srcIdx = configs.findIndex(c => c.id === sourceConfigId);
      const tgtIdx = configs.findIndex(c => c.id === targetConfigId);
      if (srcIdx === -1 || tgtIdx === -1) return s;

      const src = configs[srcIdx];
      const tab = src.tabs.find(t => t.id === tabId);
      if (!tab) return s;

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

  moveActiveTabToConfig(tabId: string, targetConfigId: string): void {
    this.update(s => {
      const tab = s.tabs.find(t => t.id === tabId);
      if (!tab) return s;

      const savedTab: TabItem<TConfig> = { ...tab, id: crypto.randomUUID() };
      const activeConfigId = s.activeConfigId;

      const savedConfigs = (s.savedTabConfigs ?? []).map(c => {
        if (c.id === targetConfigId) {
          return { ...c, tabs: [...c.tabs, savedTab] };
        }
        if (activeConfigId && c.id === activeConfigId) {
          const remaining = c.tabs.filter(t => t.id !== tabId);
          if (remaining.length === 0) return c;
          return { ...c, tabs: remaining, activeTabId: c.activeTabId === tabId ? remaining[0].id : c.activeTabId };
        }
        return c;
      });

      const remainingTabs = s.tabs.filter(t => t.id !== tabId);

      if (remainingTabs.length === 0) {
        const defaultTab: TabItem<TConfig> = {
          id: crypto.randomUUID(),
          title: 'New Tab',
          autoTitle: true,
          config: this.defaultConfigFactory(),
        };
        return { ...s, tabs: [defaultTab], activeTabId: defaultTab.id, activeConfigId: null, savedTabConfigs: savedConfigs };
      }

      let newActiveTabId = s.activeTabId;
      if (newActiveTabId === tabId) {
        const idx = Math.min(s.tabs.findIndex(t => t.id === tabId), remainingTabs.length - 1);
        newActiveTabId = remainingTabs[idx].id;
      }

      return { ...s, tabs: remainingTabs, activeTabId: newActiveTabId, savedTabConfigs: savedConfigs };
    });
  }

  applyTabConfig(config: SavedTabConfig<TConfig>): void {
    const restoredTabs = config.tabs.map(t => ({ ...t }));
    const activeTabId = config.activeTabId ?? restoredTabs[0]?.id;
    this.update(s => ({
      ...s,
      tabs: restoredTabs,
      activeTabId,
      activeConfigId: config.id,
    }));
  }

  newConfig(): void {
    const tab: TabItem<TConfig> = {
      id: crypto.randomUUID(),
      title: 'New Tab',
      autoTitle: true,
      config: this.defaultConfigFactory(),
    };
    this.update(s => ({
      ...s,
      tabs: [tab],
      activeTabId: tab.id,
      activeConfigId: null,
    }));
  }

  /* ── Private helpers ──────────────────────────── */

  private patchTab(id: string, updater: (tab: TabItem<TConfig>) => TabItem<TConfig>): void {
    this.update(s => ({
      ...s,
      tabs: s.tabs.map(t => t.id === id ? updater(t) : t),
    }));
  }

  private patchSavedConfig(configId: string, updater: (cfg: SavedTabConfig<TConfig>) => SavedTabConfig<TConfig>): void {
    this.update(s => ({
      ...s,
      savedTabConfigs: (s.savedTabConfigs ?? []).map(c => c.id === configId ? updater(c) : c),
    }));
  }
}
