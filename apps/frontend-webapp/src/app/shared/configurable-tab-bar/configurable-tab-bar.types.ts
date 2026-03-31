/** Generic tab item — domain features extend via TConfig */
export type TabItem<TConfig = unknown> = {
  id: string;
  title: string;
  autoTitle: boolean;
  color?: string;
  config: TConfig;
};

/** A named snapshot of tabs that can be saved/recalled */
export type SavedTabConfig<TConfig = unknown> = {
  id: string;
  name: string;
  tabs: TabItem<TConfig>[];
  activeTabId: string;
  createdAt: number;
};

/** Full tab system state */
export type TabSystemState<TConfig = unknown> = {
  tabs: TabItem<TConfig>[];
  activeTabId: string;
  activeConfigId: string | null;
  savedTabConfigs: SavedTabConfig<TConfig>[];
};
