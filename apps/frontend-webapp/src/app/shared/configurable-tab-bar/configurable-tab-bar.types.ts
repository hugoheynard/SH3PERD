/**
 * A single tab in the tab bar. Parameterized by `TConfig` for domain-specific data.
 * @template TConfig - Domain config stored per tab (e.g. search filters, query string)
 */
export type TabItem<TConfig = unknown> = {
  id: string;
  title: string;
  /** When true, the tab title was auto-generated and can be overwritten by the system. */
  autoTitle: boolean;
  /** CSS color for the tab's left border indicator. */
  color?: string;
  /** Domain-specific configuration for this tab. */
  config: TConfig;
};

/**
 * A named snapshot of tabs that can be saved and recalled later.
 * Saved configs are persisted to the backend and share IDs with active tabs.
 * @template TConfig - Domain config type matching the tab items
 */
export type SavedTabConfig<TConfig = unknown> = {
  id: string;
  name: string;
  tabs: TabItem<TConfig>[];
  activeTabId: string;
  createdAt: number;
  /**
   * UI-only flag indicating the config has reached its per-config tab quota.
   * When present and `true`, the tab bar's move-to surfaces render the row
   * as locked and emit `moveToLockedConfigClicked` on click. Optional and
   * additive — hosts that don't need quota gating simply omit it.
   *
   * The underlying storage layer should strip this field before persisting
   * (it's recomputed from plan state on every render).
   */
  locked?: boolean;
};

/**
 * Complete tab system state — the single source of truth for the tab bar.
 * Consumed by `TabMutationService` and exposed via `TabStateSignal`.
 * @template TConfig - Domain config type
 */
export type TabSystemState<TConfig = unknown> = {
  tabs: TabItem<TConfig>[];
  activeTabId: string;
  /** ID of the currently active saved config, or null if working on an unsaved set. */
  activeConfigId: string | null;
  savedTabConfigs: SavedTabConfig<TConfig>[];
};

/**
 * Minimal signal-like accessor for tab state.
 * Avoids coupling to Angular's `WritableSignal` — can be implemented as a
 * slice/view over a larger state signal.
 *
 * @example
 * ```ts
 * readonly tabState: TabStateSignal<MyConfig> = Object.assign(
 *   () => sliceTabFields(this.fullState()),
 *   { update: (fn) => this.fullState.update(s => ({ ...s, ...fn(slice(s)) })) },
 * );
 * ```
 */
export interface TabStateSignal<TConfig> {
  /** Read the current tab system state. */
  (): TabSystemState<TConfig>;
  /** Apply an immutable update to the tab system state. */
  update(updater: (s: TabSystemState<TConfig>) => TabSystemState<TConfig>): void;
}
