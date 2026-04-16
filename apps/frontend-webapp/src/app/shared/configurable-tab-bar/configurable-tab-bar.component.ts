import { Component, computed, ElementRef, inject, input, output, signal, ViewChild } from '@angular/core';
import { IconComponent } from '../icon/icon.component';
import type { TabItem, SavedTabConfig } from './configurable-tab-bar.types';
import { TAB_HANDLERS, type TabHandlers } from './tab-event.helpers';
import { TabStripComponent } from './tab-strip/tab-strip.component';
import { TabConfigPanelComponent } from './tab-config-panel/tab-config-panel.component';

/**
 * Generic, reusable tab bar with save/recall configs, DnD reorder, color coding, and inline editing.
 *
 * Orchestrator component — owns the public API (inputs/outputs, TAB_HANDLERS
 * dispatch, the add-tab button, the tab-limit upgrade popover, and the
 * single shared `<input type="color">` picker) while delegating the three
 * major visual concerns to dedicated sub-components:
 *
 * - {@link TabStripComponent} — scrollable tab list, inline rename, DnD,
 *   per-tab ⋮ menu (which itself hosts {@link TabInlineMenuComponent}).
 * - {@link TabConfigPanelComponent} — save/new/load buttons + floating panels.
 *
 * Wire tab mutations via `provideTabHandlers(MyTabMutationService)` for zero
 * boilerplate, or bind individual `(output)` events for custom overrides.
 *
 * Use `[tabBarTrailing]` content projection for domain-specific content
 * (e.g. a search input).
 *
 * @example
 * ```html
 * <sh3-configurable-tab-bar [tabs]="tabs()" [activeTabId]="activeTabId()" …>
 *   <div tabBarTrailing><input placeholder="Search…" /></div>
 * </sh3-configurable-tab-bar>
 * ```
 */
@Component({
  selector: 'sh3-configurable-tab-bar',
  standalone: true,
  imports: [IconComponent, TabStripComponent, TabConfigPanelComponent],
  templateUrl: './configurable-tab-bar.component.html',
  styleUrl: './configurable-tab-bar.component.scss',
})
export class ConfigurableTabBarComponent {

  private _handlers: TabHandlers | null = inject(TAB_HANDLERS, { optional: true });

  /* ── Inputs ────────────────────────────────────── */
  readonly tabs = input.required<TabItem<unknown>[]>();
  readonly activeTabId = input.required<string>();
  readonly activeConfigId = input<string | null>(null);
  readonly savedConfigs = input<SavedTabConfig<unknown>[]>([]);
  /** Show built-in toast notifications for config operations. Default: true. */
  readonly showToasts = input<boolean>(true);
  /** Maximum number of tabs allowed. -1 = unlimited (no limit). */
  readonly maxTabs = input<number>(-1);
  /** Whether save/recall config buttons are visible. */
  readonly canSaveRecall = input<boolean>(true);

  /* ── Quota-derived state ──────────────────────── */
  readonly tabLimitReached = computed(() => {
    const max = this.maxTabs();
    return max !== -1 && this.tabs().length >= max;
  });

  /* ── Outputs (public API — also dispatched via TAB_HANDLERS) ── */
  readonly tabSelect = output<string>();
  readonly tabAdd = output<void>();
  readonly tabClose = output<string>();
  readonly tabRename = output<{ id: string; title: string }>();
  readonly tabReorder = output<{ tabId: string; newIndex: number }>();
  readonly tabColorChange = output<{ id: string; color: string }>();
  readonly configSave = output<string>();
  readonly configNew = output<void>();
  readonly configLoad = output<SavedTabConfig<unknown>>();
  readonly configDelete = output<string>();
  readonly configRename = output<{ configId: string; name: string }>();
  readonly configTabRemove = output<{ configId: string; tabId: string }>();
  readonly configTabRename = output<{ configId: string; tabId: string; title: string }>();
  readonly configTabMove = output<{ sourceConfigId: string; targetConfigId: string; tabId: string }>();
  readonly tabMoveToConfig = output<{ tab: TabItem<unknown>; targetConfigId: string }>();
  readonly upgradeRequested = output<void>();

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

  /* ── Upgrade popover ────────────────────────────── */
  readonly showUpgradePopover = signal(false);

  toggleUpgradePopover(): void {
    this.showUpgradePopover.update(v => !v);
  }

  onUpgrade(): void {
    this.showUpgradePopover.set(false);
    this.upgradeRequested.emit();
  }

  /* ── Add tab ───────────────────────────────────── */

  onTabAdd(): void {
    this._handlers?.tabAdd();
    this.tabAdd.emit();
  }

  /* ── Dispatch helper ─────────────────────────────
   * Calls tabHandlers (if set) then emits the output. This keeps both the
   * TAB_HANDLERS wiring and the (output) bindings working side-by-side. */

  dispatch<K extends keyof TabHandlers<unknown>>(key: K, payload: Parameters<TabHandlers<unknown>[K]>[0]): void {
    const handlers = this._handlers;
    if (handlers) (handlers[key] as (p: unknown) => void)(payload);
    (this[key] as { emit: (p: unknown) => void }).emit(payload);
  }
}
