import {
  InjectionToken,
  inject,
  type Type,
  type AbstractType,
} from '@angular/core';
import type { TabMutationService } from './tab-mutation.service';

/**
 * Shape of every event the bar dispatches, keyed by event name. Single
 * source of truth for the bar's mutation surface — both {@link TabHandlers}
 * and the orchestrator's `dispatch()` helper are derived from this map.
 *
 * Note: the UI-only `*LockClicked` / `moveToLockedConfigClicked` outputs
 * are intentionally absent — they signal host concerns (upgrade flow,
 * tooltip, …) rather than tab mutations, and are wired via plain `(output)`
 * bindings instead of the handler map.
 */
export type TabBarDispatchPayloads = {
  tabSelect: string;
  tabAdd: void;
  tabClose: string;
  tabRename: { id: string; title: string };
  tabReorder: { tabId: string; newIndex: number };
  tabColorChange: { id: string; color: string };
  configSave: string;
  configNew: void;
  configLoad: string;
  configDelete: string;
  configRename: { configId: string; name: string };
  configTabRemove: { configId: string; tabId: string };
  configTabRename: { configId: string; tabId: string; title: string };
  configTabMove: {
    sourceConfigId: string;
    targetConfigId: string;
    tabId: string;
  };
  tabMoveToConfig: { tabId: string; targetConfigId: string };
};

export type TabBarDispatchKey = keyof TabBarDispatchPayloads;

/**
 * Handler map matching every mutation event of `ConfigurableTabBarComponent`.
 * Provided via `TAB_HANDLERS` injection token for automatic wiring.
 * Derived from {@link TabBarDispatchPayloads} so the two stay in lockstep.
 */
export type TabHandlers = {
  [K in TabBarDispatchKey]: (payload: TabBarDispatchPayloads[K]) => void;
};

/**
 * Injection token for tab handlers. Provide this in the host component's `providers`
 * to wire all tab-bar events automatically — no outputs needed.
 *
 * @example
 * ```ts
 * @Component({
 *   providers: [provideTabHandlers(MusicTabMutationService)],
 * })
 * ```
 */
export const TAB_HANDLERS = new InjectionToken<TabHandlers>('TAB_HANDLERS');

/**
 * Provider factory — provide in the host component's `providers` array.
 * Injects the given `TabMutationService` subclass and wires all events.
 *
 * @example
 * ```ts
 * @Component({
 *   providers: [provideTabHandlers(MusicTabMutationService)],
 * })
 * ```
 */
export function provideTabHandlers<TConfig>(
  serviceToken:
    | Type<TabMutationService<TConfig>>
    | AbstractType<TabMutationService<TConfig>>,
) {
  return {
    provide: TAB_HANDLERS,
    useFactory: (): TabHandlers => {
      const service = inject(serviceToken as Type<TabMutationService<TConfig>>);
      return {
        tabSelect: (id) => service.setActiveTab(id),
        tabAdd: () => service.addDefaultTab(),
        tabClose: (id) => service.closeTab(id),
        tabRename: (e) => service.updateTabTitle(e.id, e.title),
        tabReorder: (e) => service.reorderTab(e.tabId, e.newIndex),
        tabColorChange: (e) => service.setTabColor(e.id, e.color),
        configSave: (name) => service.saveTabConfig(name),
        configNew: () => service.newConfig(),
        configLoad: (configId) => service.loadTabConfig(configId),
        configDelete: (id) => service.deleteTabConfig(id),
        configRename: (e) => service.renameTabConfig(e.configId, e.name),
        configTabRemove: (e) =>
          service.removeTabFromConfig(e.configId, e.tabId),
        configTabRename: (e) =>
          service.renameTabInConfig(e.configId, e.tabId, e.title),
        configTabMove: (e) =>
          service.moveTabToConfig(e.sourceConfigId, e.targetConfigId, e.tabId),
        tabMoveToConfig: (e) =>
          service.moveActiveTabToConfig(e.tabId, e.targetConfigId),
      };
    },
  };
}
