import { InjectionToken, inject, type Type, type AbstractType } from '@angular/core';
import type { TabItem, SavedTabConfig } from './configurable-tab-bar.types';
import type { TabMutationService } from './tab-mutation.service';

/**
 * Handler map matching every output of `ConfigurableTabBarComponent`.
 * Provided via `TAB_HANDLERS` injection token for automatic wiring.
 */
export type TabHandlers<TConfig = any> = {
  tabSelect:       (id: string) => void;
  tabAdd:          () => void;
  tabClose:        (id: string) => void;
  tabRename:       (e: { id: string; title: string }) => void;
  tabReorder:      (e: { tabId: string; newIndex: number }) => void;
  tabColorChange:  (e: { id: string; color: string }) => void;
  configSave:      (name: string) => void;
  configNew:       () => void;
  configLoad:      (config: SavedTabConfig<TConfig>) => void;
  configDelete:    (id: string) => void;
  configRename:    (e: { configId: string; name: string }) => void;
  configTabRemove: (e: { configId: string; tabId: string }) => void;
  configTabRename: (e: { configId: string; tabId: string; title: string }) => void;
  configTabMove:   (e: { sourceConfigId: string; targetConfigId: string; tabId: string }) => void;
  tabMoveToConfig: (e: { tab: TabItem<TConfig>; targetConfigId: string }) => void;
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
export function provideTabHandlers<TConfig>(serviceToken: Type<TabMutationService<TConfig>> | AbstractType<TabMutationService<TConfig>>) {
  return {
    provide: TAB_HANDLERS,
    useFactory: (): TabHandlers<TConfig> => {
      const service = inject(serviceToken as Type<TabMutationService<TConfig>>);
      return {
        tabSelect:       (id) => service.setActiveTab(id),
        tabAdd:          () => service.addDefaultTab(),
        tabClose:        (id) => service.closeTab(id),
        tabRename:       (e) => service.updateTabTitle(e.id, e.title),
        tabReorder:      (e) => service.reorderTab(e.tabId, e.newIndex),
        tabColorChange:  (e) => service.setTabColor(e.id, e.color),
        configSave:      (name) => service.saveTabConfig(name),
        configNew:       () => service.newConfig(),
        configLoad:      (config) => service.applyTabConfig(config),
        configDelete:    (id) => service.deleteTabConfig(id),
        configRename:    (e) => service.renameTabConfig(e.configId, e.name),
        configTabRemove: (e) => service.removeTabFromConfig(e.configId, e.tabId),
        configTabRename: (e) => service.renameTabInConfig(e.configId, e.tabId, e.title),
        configTabMove:   (e) => service.moveTabToConfig(e.sourceConfigId, e.targetConfigId, e.tabId),
        tabMoveToConfig: (e) => service.moveActiveTabToConfig(e.tab.id, e.targetConfigId),
      };
    },
  };
}
