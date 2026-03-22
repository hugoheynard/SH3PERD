import {
  Directive,
  ElementRef,
  inject, input,
  type OnDestroy,
  type OnInit,
  output,
} from '@angular/core';
import { DropZoneRegistryService } from './drop-zone-registry.service';
import type { DragState, DragType } from './drag.types';


/**
 * Directive that registers a DOM element as a drop zone within the Drag & Drop system.
 *
 * ---------------------------------------------------------------------------
 * 🧠 ROLE IN ARCHITECTURE
 * ---------------------------------------------------------------------------
 *
 * This directive is part of the **Drag & Drop Interaction Layer**.
 *
 * It connects a DOM element to the {@link DropZoneRegistryService},
 * enabling it to:
 *
 * - Be detected as a valid drop target
 * - Filter accepted drag types
 * - Emit drop events when a compatible drag is released
 *
 * ---------------------------------------------------------------------------
 * ⚡ RESPONSIBILITIES
 * ---------------------------------------------------------------------------
 *
 * - Register the host element as a drop zone on init
 * - Unregister it on destroy
 * - Define which drag types are accepted
 * - Forward drop events through an Angular output
 *
 * ---------------------------------------------------------------------------
 * 🧩 INPUTS
 * ---------------------------------------------------------------------------
 *
 * @input dropZone_id (required)
 * Unique identifier of the drop zone.
 * Used internally to match drop targets and dispatch drop events.
 *
 * @input dropZoneAccept (required)
 * List or single drag type accepted by this zone.
 *
 * Accepts:
 * - A single drag type (e.g. `'slot'`)
 * - Or an array of drag types (e.g. `['slot', 'artist']`)
 *
 * Types are derived from {@link DragPayloadMap}.
 *
 * ---------------------------------------------------------------------------
 * 📤 OUTPUTS
 * ---------------------------------------------------------------------------
 *
 * @output uiDndDrop
 * Emits when a compatible drag is dropped on this zone.
 *
 * Payload is a {@link DragState}, allowing type-safe handling:
 *
 * ```ts
 * if (event.type === 'slot') {
 *   // event.data is ArtistPerformanceSlot
 * }
 * ```
 *
 * ---------------------------------------------------------------------------
 * 🔍 DROP RESOLUTION
 * ---------------------------------------------------------------------------
 *
 * Drop detection is handled by {@link DropZoneRegistryService}:
 *
 * - Uses `document.elementsFromPoint()` to detect hovered elements
 * - Traverses the DOM tree to find the nearest registered drop zone
 * - Filters zones based on accepted drag types
 *
 * ---------------------------------------------------------------------------
 * 🧠 DESIGN PRINCIPLES
 * ---------------------------------------------------------------------------
 *
 * - Declarative usage in templates
 * - No business logic (delegated to services)
 * - Fully decoupled from drag source implementation
 * - Works with strongly typed drag payloads
 *
 * ---------------------------------------------------------------------------
 * 💡 USAGE EXAMPLE
 * ---------------------------------------------------------------------------
 *
 * ```html
 * <div
 *   uiDndDropZone
 *   [dropZone_id]="room.id"
 *   [dropZoneAccept]="['slot']"
 *   (uiDndDrop)="onSlotDropped($event)"
 * >
 * </div>
 * ```
 *
 * ---------------------------------------------------------------------------
 * ⚠️ NOTES
 * ---------------------------------------------------------------------------
 *
 * - The directive does NOT handle drag state itself
 * - It only declares a drop target and delegates logic to the registry
 * - Accept types should match keys of {@link DragPayloadMap}
 *
 * ---------------------------------------------------------------------------
 * 🚀 EXTENSIONS
 * ---------------------------------------------------------------------------
 *
 * This directive can be extended to support:
 *
 * - Hover states (drag over feedback)
 * - Drop validation rules
 * - Visual highlighting of active zones
 * - Nested drop zone prioritization
 *
 */
@Directive({
  selector: '[uiDndDropZone]',
  standalone: true
})
export class DndDropZoneDirective implements OnInit, OnDestroy {

  private el = inject(ElementRef<HTMLElement>);
  private registry = inject(DropZoneRegistryService);

  // ------------------ I/O ---------------------------//
  dropZone_id= input.required<unknown>();
  dropZoneAccept = input.required<DragType | DragType[]>();
  uiDndDrop = output<DragState>()

  // ------------------ LIFECYCLE ---------------------------//
  ngOnInit() {
    const acceptInput = this.dropZoneAccept();

    const accept: DragType[] = Array.isArray(acceptInput)
      ? acceptInput
      : [acceptInput];

    this.registry.register({
      el: this.el.nativeElement,
      id: this.dropZone_id(),
      accept,
      onDrop: drag => this.uiDndDrop.emit(drag)
    });

  }

  ngOnDestroy() {
    this.registry.unregister(this.el.nativeElement);
  }
}
