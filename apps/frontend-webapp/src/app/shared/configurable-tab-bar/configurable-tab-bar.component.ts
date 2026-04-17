import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  inject,
  input,
  output,
  ViewChild,
} from '@angular/core';
import { ButtonIconComponent } from '../button-icon/button-icon.component';
import type { TabItem, SavedTabConfig } from './configurable-tab-bar.types';
import { TAB_HANDLERS, type TabHandlers } from './tab-event.helpers';
import { TabStripComponent } from './tab-strip/tab-strip.component';
import { TabConfigPanelComponent } from './tab-config-panel/tab-config-panel.component';

type TabBarDispatchPayloads = {
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

type TabBarDispatchKey = keyof TabBarDispatchPayloads;

/**
 * Generic, reusable tab bar with save/recall configs, DnD reorder, color coding, and inline editing.
 *
 * Orchestrator component — owns the public API (inputs/outputs, TAB_HANDLERS
 * dispatch, and the single shared `<input type="color">` picker) while
 * delegating the three major visual concerns to dedicated sub-components:
 *
 * - {@link TabStripComponent} — scrollable tab list, inline rename, DnD,
 *   per-tab ⋮ menu (which itself hosts {@link TabInlineMenuComponent}).
 * - {@link TabConfigPanelComponent} — save/new/load buttons + floating panels.
 *
 * The bar is agnostic — it just renders the state it receives (tabs +
 * configs) and fires events on every user action. All quota / plan logic
 * lives in the host, expressed as three uniform lock surfaces, one per
 * resource type:
 *
 * - **Tab resource.** `[tabLocked]` swaps the `+` button for a `lock` icon
 *   and routes clicks to `(tabLockClicked)` instead of `(tabAdd)`.
 * - **Config resource.** `[configLocked]` collapses the whole save/load
 *   panel to a single `lock` icon and routes clicks to
 *   `(configLockClicked)`.
 * - **Per-config (tabs-in-config).** Each `SavedTabConfig.locked` flag —
 *   carried on the data itself — renders the matching target row in every
 *   move-to dropdown as locked and fires `(moveToLockedConfigClicked)` on
 *   click instead of the normal move output.
 *
 * The bar never changes state as a result of a lock click — it only
 * notifies the host, which decides what to do (popover, tooltip, right
 * panel, nothing, …).
 *
 * Wire tab mutations via `provideTabHandlers(MyTabMutationService)` for zero
 * boilerplate, or bind individual `(output)` events for custom overrides.
 *
 * Use `[tabBarTrailing]` content projection for domain-specific content
 * (e.g. a search input).
 *
 * @example
 * ```html
 * <sh3-configurable-tab-bar
 *   [tabs]="tabs()"
 *   [activeTabId]="activeTabId()"
 *   [savedConfigs]="quota.savedConfigsWithLock()"
 *   [tabLocked]="quota.tabQuotaReached()"
 *   [configLocked]="quota.configQuotaReached()"
 *   (tabLockClicked)="openTabQuotaPopover()"
 *   (configLockClicked)="openConfigQuotaPopover()"
 *   (moveToLockedConfigClicked)="openConfigFullPopover($event)">
 *   <div tabBarTrailing><input placeholder="Search…" /></div>
 * </sh3-configurable-tab-bar>
 * ```
 */
@Component({
  selector: 'sh3-configurable-tab-bar',
  standalone: true,
  imports: [ButtonIconComponent, TabStripComponent, TabConfigPanelComponent],
  templateUrl: './configurable-tab-bar.component.html',
  styleUrl: './configurable-tab-bar.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConfigurableTabBarComponent {
  private _handlers: TabHandlers | null = inject(TAB_HANDLERS, {
    optional: true,
  });

  /* ── Inputs ────────────────────────────────────── */
  readonly tabs = input.required<TabItem<unknown>[]>();
  readonly activeTabId = input.required<string>();
  readonly activeConfigId = input<string | null>(null);
  readonly savedConfigs = input<SavedTabConfig<unknown>[]>([]);
  /** Show built-in toast notifications for config operations. Default: true. */
  readonly showToasts = input<boolean>(true);
  /**
   * Tab resource lock — the add-tab affordance becomes a lock button that
   * emits `tabLockClicked` instead of `tabAdd`. The host is responsible for
   * deciding when to lock (plan quota, feature gate, …) and for responding
   * to the click (popover, tooltip, …).
   */
  readonly tabLocked = input<boolean>(false);
  /**
   * Config resource lock — when true, the entire save/recall panel
   * collapses to a single lock button that emits `configLockClicked`. Same
   * contract as `tabLocked`, scoped to the saved-config surface.
   */
  readonly configLocked = input<boolean>(false);

  /* ── i18n-ready labels (English defaults) ──────── */
  /** Tooltip on the `+` button that adds a new tab. */
  readonly addTabLabel = input<string>('Add tab');
  /** Tooltip on the lock button shown when `tabLocked` is true. */
  readonly tabLimitReachedLabel = input<string>('Tab limit reached');
  /** Tooltip on the per-tab ⋮ menu toggle. */
  readonly tabActionsLabel = input<string>('Tab actions');
  /** Tooltip on the inline-menu color button. */
  readonly colorLabel = input<string>('Color');
  /** Tooltip on the inline-menu move-to-config toggle. */
  readonly moveToConfigLabel = input<string>('Move to config');
  /** Heading shown above the list of move-to targets in the inline menu. */
  readonly moveToLabel = input<string>('Move to');
  /** Tooltip on the inline-menu close button. */
  readonly closeLabel = input<string>('Close');
  /** Tooltip on the config-panel lock button (shown when `configLocked` is true). */
  readonly saveLockedLabel = input<string>("Can't save more configurations");
  /** Tooltip on the "new blank config" button (shown when a config is active). */
  readonly newConfigLabel = input<string>('New blank configuration');
  /** Tooltip on the "save current config" button. */
  readonly saveConfigLabel = input<string>('Save current tab configuration');
  /** Tooltip on the "load saved config" button. */
  readonly loadConfigLabel = input<string>('Load saved configuration');
  /** Placeholder text in the save-config name input. */
  readonly configNamePlaceholder = input<string>('Config name…');
  /** Label on the save-confirmation button inside the save form. */
  readonly saveButtonLabel = input<string>('Save');
  /** Message shown when the load menu is opened with no saved configs. */
  readonly emptyConfigsLabel = input<string>('No saved configs yet');
  /** Tooltip on the per-config chevron that toggles the tab list. */
  readonly showTabsLabel = input<string>('Show tabs');
  /** Tooltip on the rename action in the load menu (both per-config and per-tab). */
  readonly renameLabel = input<string>('Rename');
  /** Tooltip on the delete-config action in the load menu. */
  readonly deleteLabel = input<string>('Delete');
  /** Tooltip on the move-tab-between-configs action in the load menu. */
  readonly moveLabel = input<string>('Move');
  /** Tooltip on the remove-tab-from-config action in the load menu. */
  readonly removeLabel = input<string>('Remove');
  /** Heading shown above the list of move-to targets in the config panel. */
  readonly configMoveToLabel = input<string>('Move to:');
  /** Toast message shown after starting a new config. */
  readonly newConfigToast = input<string>('New configuration started');
  /** Toast message shown after deleting a config. */
  readonly deletedConfigToast = input<string>('Config deleted');
  /** Template for the "config saved" toast. `{name}` is replaced with the config name. */
  readonly savedConfigToast = input<string>('Config "{name}" saved');
  /** Template for the "config applied" toast. `{name}` is replaced with the config name. */
  readonly appliedConfigToast = input<string>('Config "{name}" applied');

  /* ── Outputs (public API — also dispatched via TAB_HANDLERS) ── */
  readonly tabSelect = output<string>();
  readonly tabAdd = output<void>();
  readonly tabClose = output<string>();
  readonly tabRename = output<{ id: string; title: string }>();
  readonly tabReorder = output<{ tabId: string; newIndex: number }>();
  readonly tabColorChange = output<{ id: string; color: string }>();
  readonly configSave = output<string>();
  readonly configNew = output<void>();
  readonly configLoad = output<string>();
  readonly configDelete = output<string>();
  readonly configRename = output<{ configId: string; name: string }>();
  readonly configTabRemove = output<{ configId: string; tabId: string }>();
  readonly configTabRename = output<{
    configId: string;
    tabId: string;
    title: string;
  }>();
  readonly configTabMove = output<{
    sourceConfigId: string;
    targetConfigId: string;
    tabId: string;
  }>();
  readonly tabMoveToConfig = output<{
    tabId: string;
    targetConfigId: string;
  }>();
  /** Emitted when the user clicks the tab-resource lock button (only rendered when `tabLocked`). */
  readonly tabLockClicked = output<void>();
  /** Emitted when the user clicks the config-resource lock button (only rendered when `configLocked`). */
  readonly configLockClicked = output<void>();
  /** Emitted when the user picks a move-to target whose `SavedTabConfig.locked` flag is `true`. */
  readonly moveToLockedConfigClicked = output<{ targetConfigId: string }>();

  /* ── Color picker (single shared DOM input) ─────── */
  @ViewChild('colorInput') colorInputRef!: ElementRef<HTMLInputElement>;
  private colorTargetTabId: string | null = null;

  onTabColorRequested(tabId: string): void {
    this.colorTargetTabId = tabId;
    this.colorInputRef.nativeElement.click();
  }

  onColorSelected(event: Event): void {
    const color = (event.target as HTMLInputElement).value;
    if (this.colorTargetTabId) {
      this.dispatch('tabColorChange', { id: this.colorTargetTabId, color });
      this.colorTargetTabId = null;
    }
  }

  /* ── Dispatch helper ─────────────────────────────
   * Calls tabHandlers (if set) then emits the output. This keeps both the
   * TAB_HANDLERS wiring and the (output) bindings working side-by-side. */

  dispatch<K extends TabBarDispatchKey>(
    key: K,
    payload: TabBarDispatchPayloads[K],
  ): void {
    const handlers = this._handlers;
    const handler = handlers?.[key] as
      | ((payload: TabBarDispatchPayloads[K]) => void)
      | undefined;
    const emitter = this[key] as {
      emit: (payload: TabBarDispatchPayloads[K]) => void;
    };

    if (handler) {
      handler(payload);
    }
    emitter.emit(payload);
  }
}
