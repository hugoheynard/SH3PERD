import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonIconComponent } from '../../button-icon/button-icon.component';
import { DndDragDirective } from '../../../core/drag-and-drop/dndDrag.directive';
import { DndDropZoneDirective } from '../../../core/drag-and-drop/dnd-drop-zone.directive';
import { DragSessionService } from '../../../core/drag-and-drop/drag-session.service';
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
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly dragSession = inject(DragSessionService);

  /* ── Inputs ────────────────────────────────────── */
  readonly tabs = input.required<TabItem<unknown>[]>();
  readonly activeTabId = input.required<string>();
  readonly savedConfigs = input<SavedTabConfig<unknown>[]>([]);
  /** Gate for the "move to config" action inside the per-tab ⋮ menu. */
  readonly canMoveToConfig = input<boolean>(true);
  /** i18n labels — forwarded by the orchestrator. */
  readonly tabActionsLabel = input<string>('Tab actions');
  readonly colorLabel = input<string>('Color');
  readonly moveToConfigLabel = input<string>('Move to config');
  readonly moveToLabel = input<string>('Move to');
  readonly closeLabel = input<string>('Close');

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

  /* ── Keyboard a11y ─────────────────────────────── */

  /**
   * Handle keyboard navigation within the tablist. Uses the automatic
   * activation pattern: arrow / Home / End move focus AND emit
   * `tabSelect`, so the active tab follows the keyboard cursor (tabs are
   * cheap to select — no expensive panel swap).
   *
   * Events originating from the inline rename input, the ⋮ menu, or the
   * inline-menu buttons bubble up here; we bail in those cases so typing
   * a rename or navigating the menu doesn't hijack tablist keys.
   */
  onTabKeydown(tab: TabItem<unknown>, event: KeyboardEvent): void {
    const target = event.target as HTMLElement;
    if (target.closest('input, button')) return;

    const tabs = this.tabs();
    const currentIdx = tabs.findIndex((t) => t.id === tab.id);
    if (currentIdx === -1) return;

    let nextIdx: number | null = null;
    switch (event.key) {
      case 'ArrowLeft':
        nextIdx = currentIdx === 0 ? tabs.length - 1 : currentIdx - 1;
        break;
      case 'ArrowRight':
        nextIdx = currentIdx === tabs.length - 1 ? 0 : currentIdx + 1;
        break;
      case 'Home':
        nextIdx = 0;
        break;
      case 'End':
        nextIdx = tabs.length - 1;
        break;
      case 'Enter':
      case ' ':
        event.preventDefault();
        this.tabSelect.emit(tab.id);
        return;
      case 'Escape':
        if (this.openTabMenuId() !== null) {
          event.preventDefault();
          this.openTabMenuId.set(null);
        }
        return;
      default:
        return;
    }

    if (nextIdx === null || nextIdx === currentIdx) return;
    event.preventDefault();
    const nextTab = tabs[nextIdx];
    this.tabSelect.emit(nextTab.id);
    this.focusTabAt(nextIdx);
  }

  private focusTabAt(index: number): void {
    const tabEls = this.host.nativeElement.querySelectorAll<HTMLElement>(
      ':scope > .tabs-scroll > .tab',
    );
    tabEls[index]?.focus();
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

  /**
   * Resolve the drop position from the pointer's last known x-coordinate
   * at drop time (kept fresh by `DragSessionService` during the drag) and
   * the live bounding boxes of the rendered `.tab` elements.
   *
   * Algorithm:
   * 1. Find the visual slot — index of the first tab whose horizontal
   *    midpoint sits to the right of the cursor. No match = drop past the
   *    last tab (append).
   * 2. Adjust for the mutation model — `reorderTab(tabId, newIndex)`
   *    splices the source out *first*, then inserts it at `newIndex` in
   *    the shortened array. If the source sat before the visual slot,
   *    removing it shifts every subsequent index down by one — we pre-
   *    compensate here so the emitted `newIndex` matches the final
   *    post-splice position the user pointed at.
   *
   * Kept intentionally agnostic of the DnD engine internals — the only
   * info we consume is `DragSessionService.cursor()`, a public signal.
   */
  onTabDrop(drag: DragState): void {
    if (drag.type !== 'tab') return;
    const tabId = drag.data.tabId;
    const tabs = this.tabs();
    const currentIndex = tabs.findIndex((t) => t.id === tabId);
    if (currentIndex === -1) return;

    const cursorX = this.dragSession.cursor().x;
    const tabEls = this.host.nativeElement.querySelectorAll<HTMLElement>(
      ':scope > .tabs-scroll > .tab',
    );

    let visualIndex = tabs.length;
    for (let i = 0; i < tabEls.length; i++) {
      const rect = tabEls[i].getBoundingClientRect();
      if (cursorX < rect.left + rect.width / 2) {
        visualIndex = i;
        break;
      }
    }

    const newIndex = visualIndex > currentIndex ? visualIndex - 1 : visualIndex;

    if (newIndex === currentIndex) return;
    this.tabReorder.emit({ tabId, newIndex });
  }
}
