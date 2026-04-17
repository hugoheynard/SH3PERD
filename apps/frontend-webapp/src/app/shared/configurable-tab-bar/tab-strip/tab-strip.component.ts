import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonIconComponent } from '../../button-icon/button-icon.component';
import { DndDragDirective } from '../../../core/drag-and-drop/dndDrag.directive';
import { DndDropZoneDirective } from '../../../core/drag-and-drop/dnd-drop-zone.directive';
import type { DragState } from '../../../core/drag-and-drop/drag.types';
import type { TabItem, SavedTabConfig } from '../configurable-tab-bar.types';
import { TabInlineMenuComponent } from '../tab-inline-menu/tab-inline-menu.component';

/**
 * Scrollable horizontal list of tabs with inline rename (dblclick), a ⋮ menu
 * per tab, and DnD reorder wiring.
 *
 * Owns only presentational state (which tab is being renamed, which ⋮ is open,
 * the rename input buffer). All mutations bubble up as outputs for the parent
 * `ConfigurableTabBarComponent` to dispatch through its TAB_HANDLERS contract.
 *
 * The color picker `<input type="color">` lives on the parent bar — this
 * component only emits `tabColorRequested` with the target tab id.
 */
@Component({
  selector: 'sh3-tab-strip',
  standalone: true,
  imports: [
    FormsModule,
    ButtonIconComponent,
    DndDragDirective,
    DndDropZoneDirective,
    TabInlineMenuComponent,
  ],
  templateUrl: './tab-strip.component.html',
  styleUrl: './tab-strip.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TabStripComponent {
  /* ── Inputs ────────────────────────────────────── */
  readonly tabs = input.required<TabItem<unknown>[]>();
  readonly activeTabId = input.required<string>();
  readonly savedConfigs = input<SavedTabConfig<unknown>[]>([]);
  /** Gate for the "move to config" action inside the per-tab ⋮ menu. */
  readonly canMoveToConfig = input<boolean>(true);

  /* ── Outputs (bubble up) ───────────────────────── */
  readonly tabSelect = output<string>();
  readonly tabClose = output<string>();
  readonly tabRename = output<{ id: string; title: string }>();
  readonly tabReorder = output<{ tabId: string; newIndex: number }>();
  readonly tabColorRequested = output<string>();
  readonly tabMoveToConfig = output<{
    tabId: string;
    targetConfigId: string;
  }>();
  readonly tabMoveToLockedConfig = output<{
    tabId: string;
    targetConfigId: string;
  }>();

  /* ── Local UI state ────────────────────────────── */
  readonly editingTabId = signal<string | null>(null);
  readonly openTabMenuId = signal<string | null>(null);
  readonly editTitle = signal('');

  /* ── Tab interactions ──────────────────────────── */

  onTabPointerUp(tab: TabItem<unknown>, event: PointerEvent): void {
    const target = event.target as HTMLElement;
    if (target.closest('button, input')) return;
    this.openTabMenuId.set(null);
    this.tabSelect.emit(tab.id);
  }

  onTabDblClick(tab: TabItem<unknown>, event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (target.closest('button, input')) return;
    this.openTabMenuId.set(null);
    this.editingTabId.set(tab.id);
    this.editTitle.set(tab.title);
  }

  toggleTabMenu(tabId: string, event: MouseEvent): void {
    event.stopPropagation();
    this.openTabMenuId.update((id) => (id === tabId ? null : tabId));
  }

  commitRename(tabId: string): void {
    const title = this.editTitle().trim();
    if (title) this.tabRename.emit({ id: tabId, title });
    this.editingTabId.set(null);
  }

  cancelRename(): void {
    this.editingTabId.set(null);
  }

  /* ── Inline menu relays ────────────────────────── */

  onColorRequested(tabId: string): void {
    this.tabColorRequested.emit(tabId);
    this.openTabMenuId.set(null);
  }

  onMoveToConfig(event: { tabId: string; targetConfigId: string }): void {
    this.tabMoveToConfig.emit(event);
    this.openTabMenuId.set(null);
  }

  onMoveToLockedConfig(event: { tabId: string; targetConfigId: string }): void {
    this.tabMoveToLockedConfig.emit(event);
    this.openTabMenuId.set(null);
  }

  onCloseRequested(tabId: string): void {
    this.tabClose.emit(tabId);
    this.openTabMenuId.set(null);
  }

  /* ── DnD reorder ───────────────────────────────── */

  onTabDrop(drag: DragState): void {
    if (drag.type !== 'tab') return;
    const tabId = drag.data.tabId;
    const tabs = this.tabs();
    const currentIndex = tabs.findIndex((t) => t.id === tabId);
    if (currentIndex === -1) return;
    // NOTE: drop-at-end-only — deferred. See ../TODO.md § Deferred.
    this.tabReorder.emit({ tabId, newIndex: tabs.length - 1 });
  }

  onTabDropAtIndex(tabId: string, targetIndex: number): void {
    this.tabReorder.emit({ tabId, newIndex: targetIndex });
  }
}
