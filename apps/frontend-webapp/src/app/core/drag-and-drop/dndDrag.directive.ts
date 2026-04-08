import {
  Directive,
  ElementRef,
  HostListener,
  inject, input, output,
} from '@angular/core';

import { DragSessionService } from './drag-session.service';
import type { DragPayloadMap, DragState, DragType } from './drag.types';


/**
 * Directive that turns a DOM element into a draggable source within the Drag & Drop system.
 *
 * ---------------------------------------------------------------------------
 * 🧠 ROLE IN ARCHITECTURE
 * ---------------------------------------------------------------------------
 *
 * This directive is part of the **Drag Source Layer** of the Drag & Drop engine.
 *
 * It is responsible for:
 *
 * - Detecting pointer interactions (down → move → up)
 * - Determining when a drag should start (threshold-based)
 * - Initializing a drag session via {@link DragSessionService}
 * - Emitting drag start events for UI side-effects
 *
 * It acts as the **entry point of drag interactions**.
 *
 * ---------------------------------------------------------------------------
 * ⚡ RESPONSIBILITIES
 * ---------------------------------------------------------------------------
 *
 * - Capture pointer events on the host element
 * - Apply a movement threshold before starting a drag
 * - Create and start a {@link DragState}
 * - Track pointer movement during drag
 * - Delegate drag state management to {@link DragSessionService}
 *
 * ---------------------------------------------------------------------------
 * 🧩 INPUTS
 * ---------------------------------------------------------------------------
 *
 * @input dndType (required)
 * Defines the type of the dragged entity.
 * Must be a key of {@link DragPayloadMap}.
 *
 * @input dndData (required)
 * The payload associated with the drag.
 * Its type must match the corresponding entry in {@link DragPayloadMap}.
 *
 * Example:
 *
 * ```ts
 * dndType = 'slot'
 * dndData = ArtistPerformanceSlot
 * ```
 *
 * ---------------------------------------------------------------------------
 * 📤 OUTPUTS
 * ---------------------------------------------------------------------------
 *
 * @output dragStart
 * Emits when the drag session is initiated (after threshold is reached).
 *
 * Useful for:
 *
 * - Triggering UI feedback
 * - Starting drag preview rendering
 * - Analytics / logging
 *
 * ---------------------------------------------------------------------------
 * 🖱️ DRAG START LOGIC
 * ---------------------------------------------------------------------------
 *
 * A drag session does NOT start immediately on pointer down.
 *
 * Instead, a movement threshold is applied:
 *
 * - `DRAG_THRESHOLD = 4px`
 *
 * Flow:
 *
 * 1. pointerdown → store initial position
 * 2. pointermove → compute distance
 * 3. If threshold exceeded → start drag
 *
 * This prevents accidental drags on click.
 *
 * ---------------------------------------------------------------------------
 * 🔁 POINTER LIFECYCLE
 * ---------------------------------------------------------------------------
 *
 * pointerdown:
 * - Capture pointer
 * - Store initial position
 *
 * pointermove:
 * - Check threshold
 * - Start drag if needed
 * - Update pointer position in {@link DragSessionService}
 *
 * pointerup / pointercancel:
 * - Release pointer capture
 * - Reset internal state
 *
 * ---------------------------------------------------------------------------
 * 🎯 DRAG SESSION INTEGRATION
 * ---------------------------------------------------------------------------
 *
 * When drag starts:
 *
 * ```ts
 * drag.start({
 *   type: dndType,
 *   data: dndData
 * });
 * ```
 *
 * The directive does NOT handle:
 *
 * - Drop resolution
 * - Drag preview rendering
 * - Collision or constraints
 *
 * These are handled by:
 *
 * - {@link DragEngineService}
 * - {@link DropZoneRegistryService}
 *
 * ---------------------------------------------------------------------------
 * 🧠 DESIGN PRINCIPLES
 * ---------------------------------------------------------------------------
 *
 * - Declarative usage via directive
 * - Separation of concerns (no drop logic here)
 * - Threshold-based UX (prevents accidental drags)
 * - Pointer capture for robust interaction handling
 *
 * ---------------------------------------------------------------------------
 * ⚠️ LIMITATIONS
 * ---------------------------------------------------------------------------
 *
 * - Does not currently handle conflicts with resize handles
 *   (see TODO in code)
 *
 * - Assumes a single active pointer (no multi-touch support)
 *
 * ---------------------------------------------------------------------------
 * 🚀 EXTENSIONS
 * ---------------------------------------------------------------------------
 *
 * This directive can be extended to support:
 *
 * - Axis locking (horizontal / vertical drag)
 * - Drag delay (long press)
 * - Multi-pointer / touch gestures
 * - Drag cancellation (ESC key)
 * - Custom drag handles
 *
 * ---------------------------------------------------------------------------
 * 💡 USAGE EXAMPLE
 * ---------------------------------------------------------------------------
 *
 * ```html
 * <div
 *   uiDndDrag
 *   [dndType]="'slot'"
 *   [dndData]="slot"
 *   (dragStart)="onDragStart($event)"
 * >
 * </div>
 * ```
 *
 */
@Directive({
  selector: '[uiDndDrag]',
  standalone: true
})
export class DndDragDirective {
  //TODO : gere le conflit avec resize handle
  private drag = inject(DragSessionService);
  private el = inject(ElementRef<HTMLElement>);

  dndData = input.required<DragPayloadMap[DragType]>();
  dndType = input.required<DragType>();
  /** When false, the directive ignores all pointer events (no drag possible). Default: true. */
  canDrag = input(true);
  /** Optional CSS selector — if set, drag only starts from elements matching this selector. */
  dragHandle = input<string | null>(null);
  dragStart = output<PointerEvent>();

  private pointerId: number | null = null;
  private startX = 0;
  private startY = 0;
  private dragging = false;

  private readonly DRAG_THRESHOLD = 4;

  /* ---------------- POINTER DOWN ---------------- */

  @HostListener('pointerdown', ['$event'])
  onPointerDown(event: PointerEvent) {
    if (!this.canDrag()) return;
    if (event.button !== 0) return;

    const target = event.target as HTMLElement;

    // If a drag handle is specified, only start from that handle
    const handle = this.dragHandle();
    if (handle && !target.closest(handle)) return;

    // Don't capture pointer if click originates from an interactive child (button, input, a)
    if (!handle && target.closest('button, input, a, [role="button"].tab-action-btn')) return;

    this.pointerId = event.pointerId;
    this.startX = event.clientX;
    this.startY = event.clientY;
    this.dragging = false;

    this.el.nativeElement.setPointerCapture(event.pointerId);
  }

  /* ---------------- POINTER MOVE ---------------- */

  @HostListener('pointermove', ['$event'])
  onPointerMove(event: PointerEvent) {

    if (event.pointerId !== this.pointerId) return;

    const dx = event.clientX - this.startX;
    const dy = event.clientY - this.startY;

    const distance = Math.sqrt(dx * dx + dy * dy);

    // seuil non atteint
    if (!this.dragging && distance < this.DRAG_THRESHOLD) {
      return;
    }

    // démarrage du drag
    if (!this.dragging) {

      this.dragging = true;

      const drag: DragState = {
        type: this.dndType(),
        data: this.dndData() as any
      };

      this.drag.start(drag);

      this.dragStart.emit(event);
      this.drag.updatePointer(event);
      return;
    }

    this.drag.updatePointer(event);
  }

  /* ---------------- POINTER UP ---------------- */

  @HostListener('pointerup', ['$event'])
  onPointerUp(event: PointerEvent) {

    if (event.pointerId !== this.pointerId) {
      return;
    }

    this.releasePointer(event);
  };

  /* ---------------- POINTER CANCEL ---------------- */

  @HostListener('pointercancel', ['$event'])
  onPointerCancel(event: PointerEvent) {

    if (event.pointerId !== this.pointerId) {
      return;
    }

    this.releasePointer(event);
  }

  /* ---------------- HELPERS ---------------- */

  private releasePointer(event: PointerEvent) {

    try {
      this.el.nativeElement.releasePointerCapture(event.pointerId);
    } catch {}

    this.pointerId = null;
    this.dragging = false;
  }

}
