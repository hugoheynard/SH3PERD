import { Component, computed, ElementRef, inject, input, output, signal, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonComponent } from '../button/button.component';
import { InputComponent } from '../forms/input/input.component';
import { DndDragDirective } from '../../core/drag-and-drop/dndDrag.directive';
import { DndDropZoneDirective } from '../../core/drag-and-drop/dnd-drop-zone.directive';
import type { DragState } from '../../core/drag-and-drop/drag.types';
import type { TabItem, SavedTabConfig } from './configurable-tab-bar.types';
import { TAB_HANDLERS, type TabHandlers } from './tab-event.helpers';
import { ToastService } from '../toast/toast.service';
import { IconComponent } from '../icon/icon.component';

/**
 * Generic, reusable tab bar with save/recall configs, DnD reorder, color coding, and inline editing.
 *
 * All tab mutations are emitted as outputs — wire them to a `TabMutationService` subclass
 * using `wireTabEvents()` for zero-boilerplate integration.
 *
 * Use `[tabBarTrailing]` content projection for domain-specific content (e.g. search input).
 *
 * @example
 * ```html
 * <sh3-configurable-tab-bar [tabs]="tabs()" [activeTabId]="activeTabId()" ...outputs>
 *   <div tabBarTrailing><input placeholder="Search…" /></div>
 * </sh3-configurable-tab-bar>
 * ```
 */
@Component({
  selector: 'sh3-configurable-tab-bar',
  standalone: true,
  imports: [FormsModule, ButtonComponent, InputComponent, DndDragDirective, DndDropZoneDirective, IconComponent],
  templateUrl: './configurable-tab-bar.component.html',
  styleUrl: './configurable-tab-bar.component.scss',
})
export class ConfigurableTabBarComponent {

  private toast = inject(ToastService);
  private _handlers: TabHandlers | null = inject(TAB_HANDLERS, { optional: true });

  /* ── Inputs ────────────────────────────────────── */
  readonly tabs = input.required<TabItem<any>[]>();
  readonly activeTabId = input.required<string>();
  readonly activeConfigId = input<string | null>(null);
  readonly savedConfigs = input<SavedTabConfig<any>[]>([]);
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

  /* ── Outputs (still available for custom overrides) ── */
  readonly tabSelect = output<string>();
  readonly tabAdd = output<void>();
  readonly tabClose = output<string>();
  readonly tabRename = output<{ id: string; title: string }>();
  readonly tabReorder = output<{ tabId: string; newIndex: number }>();
  readonly tabColorChange = output<{ id: string; color: string }>();
  readonly configSave = output<string>();
  readonly configNew = output<void>();
  readonly configLoad = output<SavedTabConfig<any>>();
  readonly configDelete = output<string>();
  readonly configRename = output<{ configId: string; name: string }>();
  readonly configTabRemove = output<{ configId: string; tabId: string }>();
  readonly configTabRename = output<{ configId: string; tabId: string; title: string }>();
  readonly configTabMove = output<{ sourceConfigId: string; targetConfigId: string; tabId: string }>();
  readonly tabMoveToConfig = output<{ tab: TabItem<any>; targetConfigId: string }>();
  readonly upgradeRequested = output<void>();

  /* ── Tab editing state ─────────────────────────── */
  editingTabId = signal<string | null>(null);
  editTitle = '';

  /* ── Config save/load UI ───────────────────────── */
  showSaveForm = signal(false);
  showLoadMenu = signal(false);
  saveFormName = signal('');

  /* ── Color picker ──────────────────────────────── */
  @ViewChild('colorInput') colorInputRef!: ElementRef<HTMLInputElement>;
  private colorTargetTabId: string | null = null;

  /* ── Tab inline menu ───────────────────────────── */
  openTabMenuId = signal<string | null>(null);
  tabMoveMenuId = signal<string | null>(null);
  moveDropdownPos = signal<{ top: number; left: number }>({ top: 0, left: 0 });

  /* ── Upgrade popover ────────────────────────────── */
  showUpgradePopover = signal(false);

  toggleUpgradePopover(): void {
    this.showUpgradePopover.update(v => !v);
  }

  onUpgrade(): void {
    this.showUpgradePopover.set(false);
    this.upgradeRequested.emit();
  }

  /* ── Config editing state ──────────────────────── */
  expandedConfigId = signal<string | null>(null);
  editingConfigNameId = signal<string | null>(null);
  editConfigName = '';
  editingConfigTabId = signal<{ configId: string; tabId: string } | null>(null);
  editConfigTabTitle = '';
  moveMenuTabCtx = signal<{ configId: string; tabId: string } | null>(null);

  /* ── Tab interactions ──────────────────────────── */

  onTabPointerUp(tab: TabItem<any>, event: PointerEvent): void {
    const target = event.target as HTMLElement;
    if (target.closest('button, input')) return;
    this.openTabMenuId.set(null);
    this.dispatch('tabSelect', tab.id);
  }

  onTabDblClick(tab: TabItem<any>, event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (target.closest('button, input')) return;
    this.openTabMenuId.set(null);
    this.editingTabId.set(tab.id);
    this.editTitle = tab.title;
  }

  onClose(event: MouseEvent, tabId: string): void {
    event.stopPropagation();
    this.dispatch('tabClose', tabId);
  }

  commitRename(tabId: string): void {
    const title = this.editTitle.trim();
    if (title) this.dispatch('tabRename', { id: tabId, title });
    this.editingTabId.set(null);
  }

  cancelRename(): void {
    this.editingTabId.set(null);
  }

  /* ── Tab inline menu ───────────────────────────── */

  toggleTabMenu(tabId: string, event: MouseEvent): void {
    event.stopPropagation();
    this.tabMoveMenuId.set(null);
    this.openTabMenuId.update(id => id === tabId ? null : tabId);
  }

  toggleTabMoveMenu(tabId: string, event: MouseEvent, btnEl: HTMLElement): void {
    event.stopPropagation();
    const opening = this.tabMoveMenuId() !== tabId;
    this.tabMoveMenuId.update(id => id === tabId ? null : tabId);
    if (opening) {
      const rect = btnEl.getBoundingClientRect();
      this.moveDropdownPos.set({ top: rect.bottom + 4, left: rect.left });
    }
  }

  onMoveActiveTabToConfig(tab: TabItem<any>, targetConfigId: string, event: MouseEvent): void {
    event.stopPropagation();
    this.dispatch('tabMoveToConfig', { tab, targetConfigId });
    this.tabMoveMenuId.set(null);
    this.openTabMenuId.set(null);
  }

  /* ── Color picker ──────────────────────────────── */

  openColorPicker(tabId: string, event: MouseEvent): void {
    event.stopPropagation();
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

  /* ── DnD reorder ───────────────────────────────── */

  onTabDrop(drag: DragState): void {
    if (drag.type !== 'tab') return;
    const tabId = drag.data.tabId;
    const tabs = this.tabs();
    const currentIndex = tabs.findIndex(t => t.id === tabId);
    if (currentIndex === -1) return;
    this.dispatch('tabReorder', { tabId, newIndex: tabs.length - 1 });
  }

  onTabDropAtIndex(tabId: string, targetIndex: number): void {
    this.dispatch('tabReorder', { tabId, newIndex: targetIndex });
  }

  /* ── Config save/load ──────────────────────────── */

  onNewConfig(event: MouseEvent): void {
    event.stopPropagation();
    this.showLoadMenu.set(false);
    this.showSaveForm.set(false);
    this._handlers?.configNew();
    this.configNew.emit();
    if (this.showToasts()) this.toast.show('New configuration started', 'info');
  }

  toggleSaveForm(): void {
    this.showSaveForm.update(v => !v);
    this.showLoadMenu.set(false);
    this.saveFormName.set('');
  }

  toggleLoadMenu(): void {
    this.showLoadMenu.update(v => !v);
    this.showSaveForm.set(false);
  }

  submitSaveForm(): void {
    const name = this.saveFormName().trim();
    if (!name) return;
    this.dispatch('configSave', name);
    this.showSaveForm.set(false);
    this.saveFormName.set('');
    if (this.showToasts()) this.toast.show(`Config "${name}" saved`, 'success');
  }

  onLoadConfig(config: SavedTabConfig<any>): void {
    this.dispatch('configLoad', config);
    this.showLoadMenu.set(false);
    if (this.showToasts()) this.toast.show(`Config "${config.name}" applied`, 'success');
  }

  onDeleteConfig(id: string, event: MouseEvent): void {
    event.stopPropagation();
    this.dispatch('configDelete', id);
    if (this.showToasts()) this.toast.show('Config deleted', 'info');
  }

  /* ── Config editing ────────────────────────────── */

  toggleConfigExpand(configId: string, event: MouseEvent): void {
    event.stopPropagation();
    this.expandedConfigId.update(id => id === configId ? null : configId);
  }

  startConfigRename(configId: string, name: string, event: MouseEvent): void {
    event.stopPropagation();
    this.editingConfigNameId.set(configId);
    this.editConfigName = name;
  }

  commitConfigRename(configId: string): void {
    const name = this.editConfigName.trim();
    if (name) this.dispatch('configRename', { configId, name });
    this.editingConfigNameId.set(null);
  }

  startConfigTabRename(configId: string, tabId: string, title: string, event: MouseEvent): void {
    event.stopPropagation();
    this.editingConfigTabId.set({ configId, tabId });
    this.editConfigTabTitle = title;
  }

  commitConfigTabRename(): void {
    const ctx = this.editingConfigTabId();
    if (!ctx) return;
    const title = this.editConfigTabTitle.trim();
    if (title) this.dispatch('configTabRename', { configId: ctx.configId, tabId: ctx.tabId, title });
    this.editingConfigTabId.set(null);
  }

  onRemoveTabFromConfig(configId: string, tabId: string, event: MouseEvent): void {
    event.stopPropagation();
    this.dispatch('configTabRemove', { configId, tabId });
  }

  toggleMoveMenu(configId: string, tabId: string, event: MouseEvent): void {
    event.stopPropagation();
    const ctx = this.moveMenuTabCtx();
    if (ctx?.configId === configId && ctx?.tabId === tabId) {
      this.moveMenuTabCtx.set(null);
    } else {
      this.moveMenuTabCtx.set({ configId, tabId });
    }
  }

  onMoveTabToConfig(targetConfigId: string, event: MouseEvent): void {
    event.stopPropagation();
    const ctx = this.moveMenuTabCtx();
    if (!ctx) return;
    this.dispatch('configTabMove', { sourceConfigId: ctx.configId, targetConfigId, tabId: ctx.tabId });
    this.moveMenuTabCtx.set(null);
  }

  moveTargetConfigs(sourceConfigId: string): SavedTabConfig<any>[] {
    return this.savedConfigs().filter(c => c.id !== sourceConfigId);
  }

  onTabAdd(): void {
    this._handlers?.tabAdd();
    this.tabAdd.emit();
  }

  /* ── Dispatch helper ─────────────────────────────
   * Calls tabHandlers (if set) then emits the output.
   * This lets consumers use either [tabHandlers] or (output) bindings. */

  private dispatch<K extends keyof TabHandlers<any>>(key: K, payload: Parameters<TabHandlers<any>[K]>[0]): void {
    const handlers = this._handlers;
    if (handlers) (handlers[key] as (p: any) => void)(payload);
    (this[key] as any).emit(payload);
  }
}
