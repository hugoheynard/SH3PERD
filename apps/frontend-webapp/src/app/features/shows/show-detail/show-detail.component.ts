import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  ElementRef,
  inject,
  input,
  viewChild,
} from '@angular/core';
import type {
  TMusicVersionId,
  TPlaylistId,
  TShowId,
  TShowSectionId,
  TShowSectionItemId,
  TShowSectionItemView,
  TShowSectionViewModel,
} from '@sh3pherd/shared-types';
import { ItemMutationService } from '../services/mutations-layer/item-mutation.service';
import { SectionMutationService } from '../services/mutations-layer/section-mutation.service';
import { ShowsDndInitService } from '../services/shows-dnd-init.service';
import { ButtonComponent } from '../../../shared/button/button.component';
import { IconComponent } from '../../../shared/icon/icon.component';
import { LoadingStateComponent } from '../../../shared/loading-state/loading-state.component';
import { TargetBarComponent } from '../../../shared/target-bar/target-bar.component';
import { DndDragDirective } from '../../../core/drag-and-drop/dndDrag.directive';
import { DndDropZoneDirective } from '../../../core/drag-and-drop/dnd-drop-zone.directive';
import { DragSessionService } from '../../../core/drag-and-drop/drag-session.service';
import type {
  DragState,
  ShowSectionDragPayload,
  ShowSectionItemDragPayload,
} from '../../../core/drag-and-drop/drag.types';
import { LayoutService } from '../../../core/services/layout.service';
import {
  NewSectionPopoverComponent,
  type NewSectionPopoverData,
} from '../new-section-popover/new-section-popover.component';
import { ShowDetailHeaderComponent } from '../show-detail-header/show-detail-header.component';
import { ShowItemRowComponent } from '../show-item-row/show-item-row.component';
import { ShowSectionHeaderComponent } from '../show-section-header/show-section-header.component';
import { ShowSectionFooterComponent } from '../show-section-footer/show-section-footer.component';
import { showItemTitle } from '../show-item-row/show-item-row.utils';
import { ShowDetailStateService } from './show-detail-state.service';

/**
 * Body of the show detail view — used by both the routed page
 * (`/app/shows/:id`) and the right-side panel mounted via `LayoutService`.
 * Keeps all the show UX in one place; the two shells just decide how
 * to pipe the id in and what chrome wraps it.
 */
@Component({
  selector: 'app-show-detail',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ButtonComponent,
    IconComponent,
    LoadingStateComponent,
    TargetBarComponent,
    ShowDetailHeaderComponent,
    ShowItemRowComponent,
    ShowSectionHeaderComponent,
    ShowSectionFooterComponent,
    DndDragDirective,
    DndDropZoneDirective,
  ],
  templateUrl: './show-detail.component.html',
  styleUrl: './show-detail.component.scss',
})
export class ShowDetailComponent {
  readonly showId = input<TShowId | null>(null);

  private readonly detailState = inject(ShowDetailStateService);
  private readonly sectionMutations = inject(SectionMutationService);
  private readonly itemMutations = inject(ItemMutationService);
  private readonly dragSession = inject(DragSessionService);
  private readonly layout = inject(LayoutService);

  /** Ref to the rendered `.sections` container — used to read each
   *  section's bounding rect and compute the insertion slot under the
   *  cursor (playlist-tracks drag pattern). */
  private readonly sectionsEl =
    viewChild<ElementRef<HTMLElement>>('sectionsEl');

  /** `'show-section'` when the user is currently reordering a section,
   *  otherwise `null`. Drives the `.dragging` class on the source row
   *  and the visibility of the cursor-driven insertion bar. */
  protected readonly reorderingSectionId = computed<TShowSectionId | null>(
    () => {
      const drag = this.dragSession.current();
      return drag?.type === 'show-section'
        ? ((drag.data as ShowSectionDragPayload).sectionId as TShowSectionId)
        : null;
    },
  );

  protected readonly isReorderingSection = computed(
    () => this.reorderingSectionId() !== null,
  );

  /** Payload of the item currently being dragged for reorder/move, or
   *  null when no `show-section-item` drag is active. */
  protected readonly reorderingItem =
    computed<ShowSectionItemDragPayload | null>(() => {
      const drag = this.dragSession.current();
      if (drag?.type !== 'show-section-item') return null;
      return drag.data as ShowSectionItemDragPayload;
    });

  /** True when any drag that targets an item slot is active — item
   *  reorder/move (`show-section-item`) OR external add from the
   *  library (`music-track`) OR playlist bundle add (`playlist`).
   *  Drives the cursor-driven insertion bar visibility so dropping a
   *  new track from outside lets the user choose the landing slot
   *  instead of always appending. */
  protected readonly isItemSlotDrag = computed<boolean>(() => {
    const drag = this.dragSession.current();
    return (
      drag?.type === 'show-section-item' ||
      drag?.type === 'music-track' ||
      drag?.type === 'playlist'
    );
  });

  /** Which section the cursor is currently over during an item drag,
   *  or null when the cursor is outside every section. Used to show
   *  the insertion bar inside the right section and to pick the
   *  target section / landing slot on drop.
   *
   *  Hit-tests by scanning every rendered `<section class="section">`
   *  element under the sections container — avoids the complexity of
   *  viewChildren refs per row and naturally handles scroll + layout
   *  changes. */
  protected readonly overSectionId = computed<TShowSectionId | null>(() => {
    if (!this.isItemSlotDrag()) return null;
    const root = this.sectionsEl()?.nativeElement;
    if (!root) return null;
    const cursor = this.dragSession.cursor();
    const rows = root.querySelectorAll<HTMLElement>('.section');
    for (const row of Array.from(rows)) {
      const r = row.getBoundingClientRect();
      if (
        cursor.x >= r.left &&
        cursor.x <= r.right &&
        cursor.y >= r.top &&
        cursor.y <= r.bottom
      ) {
        const id = row.getAttribute('data-section-id');
        return id ? (id as TShowSectionId) : null;
      }
    }
    return null;
  });

  /** Insertion slot (0..items.length) under the cursor within the
   *  section the cursor is currently over. `-1` when not applicable.
   *
   *  Semantics: `i` = "drop before item i" so `0` is top-of-list and
   *  `items.length` is end-of-list.
   */
  protected readonly itemInsertIndex = computed<number>(() => {
    const sectionId = this.overSectionId();
    if (!sectionId) return -1;
    const root = this.sectionsEl()?.nativeElement;
    if (!root) return -1;
    const list = root.querySelector<HTMLElement>(
      `.section[data-section-id="${sectionId}"] .item-list`,
    );
    if (!list) return 0; // empty section — drop at position 0

    const cursor = this.dragSession.cursor();
    const rows = list.querySelectorAll<HTMLElement>('.item');
    for (let i = 0; i < rows.length; i++) {
      const r = rows[i].getBoundingClientRect();
      if (cursor.y < r.top + r.height / 2) return i;
    }
    return rows.length;
  });

  /** Y offset (in px, inside the over-section) at which to render the
   *  item insertion bar. `-1` hides it. */
  protected readonly itemInsertY = computed<number>(() => {
    const sectionId = this.overSectionId();
    if (!sectionId) return -1;
    const idx = this.itemInsertIndex();
    if (idx < 0) return -1;
    const root = this.sectionsEl()?.nativeElement;
    if (!root) return -1;
    const list = root.querySelector<HTMLElement>(
      `.section[data-section-id="${sectionId}"] .item-list`,
    );
    if (!list) return -1;

    const rows = list.querySelectorAll<HTMLElement>('.item');
    const bbox = list.getBoundingClientRect();

    if (rows.length === 0) return 4;
    if (idx === 0) {
      return rows[0].getBoundingClientRect().top - bbox.top + list.scrollTop;
    }
    if (idx >= rows.length) {
      const last = rows[rows.length - 1].getBoundingClientRect();
      return last.bottom - bbox.top + list.scrollTop;
    }
    return rows[idx].getBoundingClientRect().top - bbox.top + list.scrollTop;
  });

  /**
   * Insertion slot (0..sections.length) under the cursor while a
   * `show-section` drag is active, or `-1` when the cursor is outside
   * the container. Semantics: `i` means "drop before row i" so `0` is
   * "at the top" and `sections.length` is "at the end".
   *
   * Runs on every cursor move because it depends on
   * `DragSessionService.cursor()`.
   */
  protected readonly insertIndex = computed<number>(() => {
    if (!this.isReorderingSection()) return -1;
    const el = this.sectionsEl()?.nativeElement;
    if (!el) return -1;

    const cursor = this.dragSession.cursor();
    const bbox = el.getBoundingClientRect();
    if (
      cursor.x < bbox.left ||
      cursor.x > bbox.right ||
      cursor.y < bbox.top ||
      cursor.y > bbox.bottom
    ) {
      return -1;
    }

    const rows = el.querySelectorAll<HTMLElement>('.section');
    for (let i = 0; i < rows.length; i++) {
      const r = rows[i].getBoundingClientRect();
      if (cursor.y < r.top + r.height / 2) return i;
    }
    return rows.length;
  });

  /**
   * Y offset (in px, inside the scrollable container) at which to
   * render the insertion bar. `-1` hides the bar. Same maths as the
   * playlist detail — accounts for scrollTop so the bar tracks rows
   * that have been scrolled off the top.
   */
  protected readonly insertY = computed<number>(() => {
    const idx = this.insertIndex();
    if (idx < 0) return -1;
    const el = this.sectionsEl()?.nativeElement;
    if (!el) return -1;

    const rows = el.querySelectorAll<HTMLElement>('.section');
    const bbox = el.getBoundingClientRect();

    if (rows.length === 0) return 4;
    if (idx === 0) {
      return rows[0].getBoundingClientRect().top - bbox.top + el.scrollTop;
    }
    if (idx >= rows.length) {
      const last = rows[rows.length - 1].getBoundingClientRect();
      return last.bottom - bbox.top + el.scrollTop;
    }
    return rows[idx].getBoundingClientRect().top - bbox.top + el.scrollTop;
  });

  protected readonly detail = this.detailState.detail;
  protected readonly loading = this.detailState.loading;
  protected readonly singleMode = this.detailState.singleMode;

  constructor() {
    // Ensure the `playlist` drag preview is registered before the first
    // drop happens. Service is `providedIn: 'root'` and idempotent — no-op
    // on subsequent component mounts. Side-effect-only inject.
    inject(ShowsDndInitService);

    // Re-fetch whenever the id changes. Unmount clears the state so
    // the next detail opens cleanly (useful when the panel closes).
    effect(() => {
      const id = this.showId();
      if (id) {
        this.detailState.loadDetail(id);
      } else {
        this.detailState.clearDetail();
      }
      this.detailState.resetHeaderState();
    });
  }

  // ── Section target duration ──────────────────────────

  /** Duration target for the section in seconds, or `null` when the
   *  section uses the track-count target mode (or has none). Feeds the
   *  `<app-target-bar>` input. */
  targetSeconds(section: TShowSectionViewModel): number | null {
    return section.target?.mode === 'duration'
      ? section.target.duration_s
      : null;
  }

  /** Commit from `<app-target-bar>` for a section — component has
   *  already validated + diffed the minutes value. */
  updateSectionTargetMinutes(
    section: TShowSectionViewModel,
    minutes: number,
  ): void {
    const show = this.detail();
    if (!show) return;
    this.sectionMutations.updateSection(show.id, section.id, {
      target: { mode: 'duration', duration_s: minutes * 60 },
    });
  }

  onAddSection(): void {
    const show = this.detail();
    if (!show) return;
    this.layout.setPopover<NewSectionPopoverComponent, NewSectionPopoverData>(
      NewSectionPopoverComponent,
      {
        showId: show.id,
        defaultName: `Set ${show.sections.length + 1}`,
      },
    );
  }

  onRemoveItem(
    section: TShowSectionViewModel,
    item: TShowSectionItemView,
  ): void {
    const show = this.detail();
    if (!show) return;
    this.itemMutations.removeItem(show.id, section.id, item.id);
  }

  /** Drop handler for a section's DnD zone. Narrows the drag type to
   *  one of the accepted kinds and dispatches the matching mutation:
   *  - `music-track` / `playlist` → add a new item at end of section
   *  - `show-section-item` → reorder within section or move across
   *    sections depending on source, using the cursor-driven insertion
   *    slot for position. */
  onSectionDrop(
    showId: TShowId,
    sectionId: TShowSectionId,
    drag: DragState,
  ): void {
    if (drag.type === 'music-track') {
      const position = this.resolveAddPosition();
      this.itemMutations.addItem(
        showId,
        sectionId,
        'version',
        drag.data.versionId as TMusicVersionId,
        position,
      );
      return;
    }
    if (drag.type === 'playlist') {
      const position = this.resolveAddPosition();
      this.itemMutations.addItem(
        showId,
        sectionId,
        'playlist',
        drag.data.playlistId as TPlaylistId,
        position,
      );
      return;
    }
    if (drag.type === 'show-section-item') {
      this.onItemReorderDrop(
        showId,
        sectionId,
        drag.data as ShowSectionItemDragPayload,
      );
    }
  }

  /** Read the cursor-driven insertion slot at drop time for external
   *  adds (music-track / playlist). Returns `undefined` when no valid
   *  slot so the backend falls back to "append at end" — happens on
   *  the rare case where the computed index resets between the last
   *  pointermove and the pointerup (e.g. cursor exits the section). */
  private resolveAddPosition(): number | undefined {
    const idx = this.itemInsertIndex();
    return idx >= 0 ? idx : undefined;
  }

  /** Apply an item drop: same-section reorder or cross-section move.
   *  Insertion slot is captured from `itemInsertIndex()` at drop time. */
  private onItemReorderDrop(
    showId: TShowId,
    targetSectionId: TShowSectionId,
    payload: ShowSectionItemDragPayload,
  ): void {
    const insertIdx = this.itemInsertIndex();
    if (insertIdx < 0) return;

    if (payload.sectionId === targetSectionId) {
      // Same section — reorder.
      const show = this.detail();
      if (!show) return;
      const section = show.sections.find((s) => s.id === targetSectionId);
      if (!section) return;

      const currentIds = section.items.map((it) => it.id);
      const fromIdx = currentIds.indexOf(payload.itemId);
      if (fromIdx === -1) return;

      // Drop-in-place is a no-op.
      if (insertIdx === fromIdx || insertIdx === fromIdx + 1) return;

      // Translate the visual slot (ghost still counts as occupying the
      // source row) into the post-removal slot the aggregate expects.
      const newPosition = insertIdx > fromIdx ? insertIdx - 1 : insertIdx;
      const next = currentIds.slice();
      next.splice(fromIdx, 1);
      next.splice(newPosition, 0, payload.itemId);
      this.itemMutations.reorderItems(showId, targetSectionId, next);
      return;
    }

    // Cross-section — move item. Backend accepts the insertion slot
    // directly (items from the source section are already gone).
    this.itemMutations.moveItem(
      showId,
      payload.itemId,
      payload.sectionId,
      targetSectionId,
      insertIdx,
    );
  }

  /** Payload builder for an item drag source — carries identity + a
   *  display title for future drag previews. */
  itemDragPayload(
    section: TShowSectionViewModel,
    item: TShowSectionItemView,
  ): ShowSectionItemDragPayload {
    return {
      itemId: item.id as TShowSectionItemId,
      sectionId: section.id,
      title: showItemTitle(item),
    };
  }

  /** Payload for a section's drag source — computed per-render so the
   *  template binding stays a stable reference. */
  sectionDragPayload(section: TShowSectionViewModel): ShowSectionDragPayload {
    return { sectionId: section.id, name: section.name };
  }

  /**
   * Drop handler for the cursor-driven sections reorder. Reads the
   * insertion slot from `insertIndex()` (computed from the cursor
   * position at drop time), normalises it to the "new position among
   * siblings" semantic the backend expects, and dispatches the full
   * ordered id list.
   */
  onSectionsReorderDrop(drag: DragState): void {
    if (drag.type !== 'show-section') return;
    const show = this.detail();
    if (!show) return;

    const idx = this.insertIndex();
    if (idx < 0) return;

    const payload = drag.data as ShowSectionDragPayload;
    const current = show.sections.map((s) => s.id);
    const fromIdx = current.indexOf(payload.sectionId);
    if (fromIdx === -1) return;

    // Drop-in-place (slot just before or just after the dragged row)
    // is a no-op — don't trigger an API round-trip for nothing.
    if (idx === fromIdx || idx === fromIdx + 1) return;

    // Translate the visual slot (the ghost still counts as occupying
    // its source row) into the post-removal slot the reorder endpoint
    // expects. Moving forward compensates for the removal shift.
    const newPosition = idx > fromIdx ? idx - 1 : idx;

    const next = current.slice();
    next.splice(fromIdx, 1);
    next.splice(newPosition, 0, payload.sectionId);

    this.sectionMutations.reorderSections(show.id, next);
  }

  trackSection(_: number, s: TShowSectionViewModel): TShowSectionId {
    return s.id;
  }

  trackItem(_: number, item: TShowSectionItemView): string {
    return item.id;
  }
}
