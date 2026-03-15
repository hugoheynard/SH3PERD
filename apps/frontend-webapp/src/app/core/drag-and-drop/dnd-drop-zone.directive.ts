import { Directive, HostListener, inject, Input } from '@angular/core';
import { DragSessionService } from './drag-session.service';
import type { DragPayloadMap } from './drag.types';


/**
 * Directive that marks an element as a valid drop zone for the drag-and-drop system.
 *
 * When a pointer enters the element during an active drag session, the directive checks
 * whether the current drag type is accepted. If so, it registers the drop zone identifier
 * in the {@link DragSessionService}. When the pointer leaves the element, the drop target
 * is cleared.
 *
 * The drop zone identifier (`dropZone_id`) can be any value (string, object, typed id, etc.).
 * The directive itself does not enforce the type; the consumer of the drag session is responsible
 * for retrieving and casting the drop target using `DragSessionService.getDropTarget<T>()`
 * during the drop handling phase.
 *
 * Example usage:
 *
 * ```html
 * <app-performance-slot
 *   [slot]="block.slot"
 *   [uiDndDropZone]
 *   [dropZone_id]="block.slot.id"
 *   [dropZoneAccept]="'artist'">
 * </app-performance-slot>
 * ```
 *
 * Accepted drag types are defined by {@link DragPayloadMap}.
 *
 * @directive
 * @selector [uiDndDropZone]
 */
@Directive({
  selector: '[uiDndDropZone]'
})
export class DndDropZoneDirective {

  private drag = inject(DragSessionService);

  /**
   * Identifier of the drop zone.
   *
   * This value is stored in the drag session when the pointer enters the zone
   * and can later be retrieved when handling the drop.
   *
   * The type is intentionally `unknown` to allow flexibility (string ids,
   * typed ids, objects, etc.). Consumers should retrieve the value using
   * `getDropTarget<T>()` and provide the expected type.
   */
  @Input() dropZone_id!: unknown;

  /**
   * List of drag types that are allowed to be dropped on this zone.
   *
   * Can be either a single drag type or an array of types.
   *
   * The types correspond to the keys of {@link DragPayloadMap}.
   *
   * Example:
   * ```html
   * [dropZoneAccept]="'artist'"
   *  [dropZoneAccept]="['artist','group']"
   * ```
   */
  @Input() dropZoneAccept!: (keyof DragPayloadMap) | (keyof DragPayloadMap)[];

  /**
   * Triggered when the pointer enters the drop zone during a drag session.
   *
   * If the current drag type is accepted by this zone, the zone identifier
   * is registered as the active drop target in the drag session.
   */
  @HostListener('pointerenter')
  onEnter() {

    const drag = this.drag.current();
    if (!drag) {
      return;
    }

    const accept = Array.isArray(this.dropZoneAccept)
      ? this.dropZoneAccept
      : [this.dropZoneAccept];

    if (!accept.includes(drag.type)) {
      return;
    }

    if (this.drag.getDropTarget() === this.dropZone_id) {
      return;
    }

    this.drag.setDropTarget(this.dropZone_id);
  }

  /**
   * Triggered when the pointer leaves the drop zone.
   *
   * Clears the current drop target from the drag session.
   */
  @HostListener('pointerleave')
  onLeave() {

    const current = this.drag.getDropTarget();

    if (current === this.dropZone_id) {
      this.drag.clearDropTarget();
    }
  }


}
