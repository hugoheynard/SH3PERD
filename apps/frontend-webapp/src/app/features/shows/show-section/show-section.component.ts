import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
} from '@angular/core';
import type {
  TMusicVersionId,
  TPlaylistId,
  TShowId,
  TShowSectionItemId,
  TShowSectionItemView,
  TShowSectionViewModel,
} from '@sh3pherd/shared-types';
import { IconComponent } from '../../../shared/icon/icon.component';
import {
  DropzoneListContainerComponent,
  type DropzoneListDropEvent,
} from '../../../shared/dropzone-list-container/dropzone-list-container.component';
import { DndDragDirective } from '../../../core/drag-and-drop/dndDrag.directive';
import { DragSessionService } from '../../../core/drag-and-drop/drag-session.service';
import type {
  DragState,
  DragType,
  ShowSectionDragPayload,
  ShowSectionItemDragPayload,
} from '../../../core/drag-and-drop/drag.types';
import { ItemMutationService } from '../services/mutations-layer/item-mutation.service';
import { ShowItemRowComponent } from '../show-item-row/show-item-row.component';
import { showItemTitle } from '../show-item-row/show-item-row.utils';

const ITEM_DRAG_TYPES: readonly DragType[] = [
  'music-track',
  'playlist',
  'show-section-item',
];

/**
 * Per-section wrapper — owns the `<section>` DOM, the `show-section`
 * drag source (+ handle selector), and the item-level drop zone via
 * `DropzoneListContainer`. Three ng-content slots let the parent
 * compose which header / target / footer each section gets:
 *
 * ```html
 * <app-show-section [showId]="showId" [section]="section" [multiSection]="...">
 *   <app-show-section-header sectionHeader ... />
 *   <app-target-bar sectionTarget ... />
 *   <app-show-section-footer sectionFooter [section]="section" />
 * </app-show-section>
 * ```
 *
 * Item drops are dispatched in-component (versions / playlists get
 * added, `show-section-item` drags are routed to reorder or cross-
 * section move depending on origin); parents don't wire any DnD.
 */
@Component({
  selector: 'app-show-section',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    IconComponent,
    DropzoneListContainerComponent,
    DndDragDirective,
    ShowItemRowComponent,
  ],
  templateUrl: './show-section.component.html',
  styleUrl: './show-section.component.scss',
  host: {
    '[class.dragging]': 'dragging()',
    '[class.is-item-reordering]': 'itemDragOverThis()',
    '[attr.data-section-id]': 'section().id',
  },
})
export class ShowSectionComponent {
  readonly showId = input.required<TShowId>();
  readonly section = input.required<TShowSectionViewModel>();
  readonly multiSection = input(false);

  private readonly itemMutations = inject(ItemMutationService);
  private readonly dragSession = inject(DragSessionService);

  protected readonly itemDragTypes = ITEM_DRAG_TYPES;

  /** True when *this* section is the source of an active `show-section`
   *  reorder drag. Drives the dim-source host class. */
  protected readonly dragging = computed<boolean>(() => {
    const drag = this.dragSession.current();
    if (drag?.type !== 'show-section') return false;
    return (
      (drag.data as ShowSectionDragPayload).sectionId === this.section().id
    );
  });

  /** True when an item-slot drag (`show-section-item` / `music-track` /
   *  `playlist`) is active AND any of its drops would land in this
   *  section. The shared container already does its own cursor hit-
   *  test; we just flag the host so SCSS can tint the whole row. */
  protected readonly itemDragOverThis = computed<boolean>(() => {
    const drag = this.dragSession.current();
    if (!drag) return false;
    if (!ITEM_DRAG_TYPES.includes(drag.type)) return false;
    // Skip if this section's own item is the drag source — the row is
    // already dimmed, no need to tint the whole section.
    return true;
  });

  protected readonly sectionDragPayload = computed<ShowSectionDragPayload>(
    () => ({
      sectionId: this.section().id,
      name: this.section().name,
    }),
  );

  protected readonly items = computed<readonly TShowSectionItemView[]>(
    () => this.section().items,
  );

  protected readonly itemId = (item: TShowSectionItemView): string => item.id;

  /** Only flag the dragged row as "internal" when it belongs to *this*
   *  section — items dragged across sections render normally in both
   *  sides until the drop lands. */
  protected readonly internalDragId = (drag: DragState): string | null => {
    if (drag.type !== 'show-section-item') return null;
    const payload = drag.data as ShowSectionItemDragPayload;
    if (payload.sectionId !== this.section().id) return null;
    return payload.itemId;
  };

  itemDragPayload(item: TShowSectionItemView): ShowSectionItemDragPayload {
    return {
      itemId: item.id as TShowSectionItemId,
      sectionId: this.section().id,
      title: showItemTitle(item),
    };
  }

  onItemDrop(event: DropzoneListDropEvent<TShowSectionItemView>): void {
    const { drag, insertIndex } = event;
    const showId = this.showId();
    const sectionId = this.section().id;

    if (drag.type === 'music-track') {
      this.itemMutations.addItem(
        showId,
        sectionId,
        'version',
        drag.data.versionId as TMusicVersionId,
        insertIndex,
      );
      return;
    }
    if (drag.type === 'playlist') {
      this.itemMutations.addItem(
        showId,
        sectionId,
        'playlist',
        drag.data.playlistId as TPlaylistId,
        insertIndex,
      );
      return;
    }
    if (drag.type === 'show-section-item') {
      this.onItemReorderOrMove(
        drag.data as ShowSectionItemDragPayload,
        insertIndex,
      );
    }
  }

  onRemoveItem(item: TShowSectionItemView): void {
    this.itemMutations.removeItem(this.showId(), this.section().id, item.id);
  }

  private onItemReorderOrMove(
    payload: ShowSectionItemDragPayload,
    insertIndex: number,
  ): void {
    const showId = this.showId();
    const sectionId = this.section().id;

    if (payload.sectionId === sectionId) {
      // Same-section reorder — translate the visual slot (ghost still
      // counts as occupying the source row) into the post-removal slot
      // the aggregate expects.
      const items = this.section().items;
      const currentIds = items.map((it) => it.id);
      const fromIdx = currentIds.indexOf(payload.itemId);
      if (fromIdx === -1) return;
      if (insertIndex === fromIdx || insertIndex === fromIdx + 1) return;
      const newPosition = insertIndex > fromIdx ? insertIndex - 1 : insertIndex;
      const next = currentIds.slice();
      next.splice(fromIdx, 1);
      next.splice(newPosition, 0, payload.itemId);
      this.itemMutations.reorderItems(showId, sectionId, next);
      return;
    }

    // Cross-section move — backend accepts the insertion slot directly.
    this.itemMutations.moveItem(
      showId,
      payload.itemId,
      payload.sectionId,
      sectionId,
      insertIndex,
    );
  }
}
