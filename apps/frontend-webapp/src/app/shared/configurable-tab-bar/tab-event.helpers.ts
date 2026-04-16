import {
  InjectionToken,
  inject,
  type Type,
  type AbstractType,
} from '@angular/core';
import type { TabMutationService } from './tab-mutation.service';

/**
 * Handler map matching every output of `ConfigurableTabBarComponent`.
 * Provided via `TAB_HANDLERS` injection token for automatic wiring.
 *
 * Note: the UI-only `lockClicked` output is intentionally absent — it signals
 * a host concern (show an upgrade flow, a tooltip, …) rather than a tab
 * mutation, so it's wired via a plain `(output)` binding instead of the
 * handler map.
 */
export type TabHandlers = {
  tabSelect: (id: string) => void;
  tabAdd: () => void;
  tabClose: (id: string) => void;
  tabRename: (e: { id: string; title: string }) => void;
  tabReorder: (e: { tabId: string; newIndex: number }) => void;
  tabColorChange: (e: { id: string; color: string }) => void;
  configSave: (name: string) => void;
  configNew: () => void;
  configLoad: (configId: string) => void;
  configDelete: (id: string) => void;
  configRename: (e: { configId: string; name: string }) => void;
  configTabRemove: (e: { configId: string; tabId: string }) => void;
  configTabRename: (e: {
    configId: string;
    tabId: string;
    title: string;
  }) => void;
  configTabMove: (e: {
    sourceConfigId: string;
    targetConfigId: string;
    tabId: string;
  }) => void;
  tabMoveToConfig: (e: { tabId: string; targetConfigId: string }) => void;
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
