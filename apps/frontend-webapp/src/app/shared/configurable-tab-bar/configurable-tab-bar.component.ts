import { Component, ElementRef, inject, input, output, ViewChild } from '@angular/core';
import { ButtonIconComponent } from '../button-icon/button-icon.component';
import type { TabItem, SavedTabConfig } from './configurable-tab-bar.types';
import { TAB_HANDLERS, type TabHandlers } from './tab-event.helpers';
import { TabStripComponent } from './tab-strip/tab-strip.component';
import { TabConfigPanelComponent } from './tab-config-panel/tab-config-panel.component';

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
 * The bar renders the add-tab affordance itself. When `locked` is true it
 * swaps the plus button for a lock button and emits `lockClicked` instead of
 * `tabAdd` — the host decides what to do (show an upgrade popover, a tooltip,
 * a right panel, …). The save/recall panel follows the same pattern via
 * `saveRecallLocked` + `saveRecallLockClicked`. The bar intentionally knows
 * nothing about quotas, plans, or popovers.
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
 *   [locked]="tabLimitReached()"
 *   (lockClicked)="openUpgradePopover()">
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
  /**
   * When true, the add-tab affordance becomes a lock button that emits
   * `lockClicked` instead of `tabAdd`. The host is responsible for deciding
   * when to lock and for responding to the click (e.g. opening a popover).
   */
  readonly locked = input<boolean>(false);
  /**
   * When true, the save/recall config panel collapses to a single lock button
   * that emits `saveRecallLockClicked`. Same contract as `locked` — the host
   * owns the decision and the click consequence.
   */
  readonly saveRecallLocked = input<boolean>(false);

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
  /** Emitted when the user clicks the lock button (only rendered when `locked` is true). */
  readonly lockClicked = output<void>();
  /** Emitted when the user clicks the save/recall lock button (only rendered when `saveRecallLocked` is true). */
  readonly saveRecallLockClicked = output<void>();

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
