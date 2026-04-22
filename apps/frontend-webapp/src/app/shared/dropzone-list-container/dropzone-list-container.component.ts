import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  TemplateRef,
  computed,
  contentChild,
  inject,
  input,
  output,
  viewChild,
} from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { DndDropZoneDirective } from '../../core/drag-and-drop/dnd-drop-zone.directive';
import { DragSessionService } from '../../core/drag-and-drop/drag-session.service';
import type { DragState, DragType } from '../../core/drag-and-drop/drag.types';

export interface DropzoneListRowContext<TItem> {
  $implicit: TItem;
  item: TItem;
  index: number;
  dragging: boolean;
}

export interface DropzoneListDropEvent<TItem> {
  drag: DragState;
  insertIndex: number;
  items: readonly TItem[];
}

@Component({
  selector: 'sh3-dropzone-list-container',
  standalone: true,
  imports: [NgTemplateOutlet, DndDropZoneDirective],
  templateUrl: './dropzone-list-container.component.html',
  styleUrl: './dropzone-list-container.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DropzoneListContainerComponent<TItem> {
  readonly items = input.required<readonly TItem[]>();
  readonly dropZoneId = input.required<unknown>();
  readonly acceptedTypes = input.required<DragType[]>();
  readonly itemId = input.required<(item: TItem, index: number) => string>();

  /** CSS selector used to locate rendered row DOM nodes inside the host.
   *  The selector must match the outer row element produced by the
   *  projected template. */
  readonly itemSelector = input('.dropzone-list-row');

  /** Drag type used for internal reorder/move inside this list. When
   *  omitted, all accepted drags are treated as external drops. */
  readonly internalDragType = input<DragType | null>(null);

  /** Extracts the dragged row id from the active drag payload so the
   *  projected template can dim the source row while it is moving. */
  readonly internalDragId = input<((drag: DragState) => string | null) | null>(
    null,
  );

  /** Vertical offset of the insertion bar in an empty list. */
  readonly emptyInsertY = input(8);

  readonly dropped = output<DropzoneListDropEvent<TItem>>();
  readonly reorderDropped = output<DropzoneListDropEvent<TItem>>();
  readonly externalDropped = output<DropzoneListDropEvent<TItem>>();

  private readonly dragSession = inject(DragSessionService);
  private readonly listEl =
    viewChild.required<ElementRef<HTMLElement>>('listEl');
  readonly rowTemplate = contentChild.required(TemplateRef);

  readonly activeDrag = this.dragSession.current;

  readonly acceptsCurrentDrag = computed(() => {
    const drag = this.activeDrag();
    return !!drag && this.acceptedTypes().includes(drag.type);
  });

  readonly isOverList = computed(() => {
    if (!this.acceptsCurrentDrag()) return false;
    const el = this.listEl().nativeElement;
    const cursor = this.dragSession.cursor();
    const bbox = el.getBoundingClientRect();
    return (
      cursor.x >= bbox.left &&
      cursor.x <= bbox.right &&
      cursor.y >= bbox.top &&
      cursor.y <= bbox.bottom
    );
  });

  readonly insertIndex = computed(() => {
    if (!this.isOverList()) return -1;
    const el = this.listEl().nativeElement;
    const rows = el.querySelectorAll<HTMLElement>(this.itemSelector());
    const cursor = this.dragSession.cursor();

    for (let i = 0; i < rows.length; i++) {
      const r = rows[i].getBoundingClientRect();
      if (cursor.y < r.top + r.height / 2) return i;
    }

    return rows.length;
  });

  readonly insertY = computed(() => {
    const idx = this.insertIndex();
    if (idx < 0) return -1;

    const el = this.listEl().nativeElement;
    const rows = el.querySelectorAll<HTMLElement>(this.itemSelector());
    const bbox = el.getBoundingClientRect();

    if (rows.length === 0) return this.emptyInsertY();
    if (idx === 0) {
      return rows[0].getBoundingClientRect().top - bbox.top + el.scrollTop;
    }
    if (idx >= rows.length) {
      const last = rows[rows.length - 1].getBoundingClientRect();
      return last.bottom - bbox.top + el.scrollTop;
    }

    return rows[idx].getBoundingClientRect().top - bbox.top + el.scrollTop;
  });

  readonly draggingItemId = computed(() => {
    const drag = this.activeDrag();
    const expectedType = this.internalDragType();
    const resolver = this.internalDragId();
    if (!drag || !expectedType || !resolver) return null;
    if (drag.type !== expectedType) return null;
    return resolver(drag);
  });

  rowContext(item: TItem, index: number): DropzoneListRowContext<TItem> {
    const id = this.itemId()(item, index);
    return {
      $implicit: item,
      item,
      index,
      dragging: this.draggingItemId() === id,
    };
  }

  trackByItem = (index: number, item: TItem): string =>
    this.itemId()(item, index);

  onDrop(drag: DragState): void {
    const insertIndex = this.insertIndex();
    if (insertIndex < 0) return;

    const event: DropzoneListDropEvent<TItem> = {
      drag,
      insertIndex,
      items: this.items(),
    };

    this.dropped.emit(event);

    if (this.internalDragType() && drag.type === this.internalDragType()) {
      this.reorderDropped.emit(event);
      return;
    }

    this.externalDropped.emit(event);
  }
}
