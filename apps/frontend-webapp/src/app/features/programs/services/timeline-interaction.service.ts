import { inject, Injectable } from '@angular/core';
import type { PerformanceSlot } from './program-state.service';
import { PointerTrackerService } from './pointer-tracker.service';
import { DragSessionService, type DragState } from './drag-session.service';

@Injectable({ providedIn: 'root' })
export class TimelineInteractionService {
  private pointer = inject(PointerTrackerService);
  private drag = inject(DragSessionService);

  currentDrag?: DragState;

  private dragStartY = 0;
  private originalStartMinutes = 0;

  private resizeStartY = 0;
  private originalDuration = 0;

  readonly PIXELS_PER_MINUTE = 5;
  readonly SNAP_MINUTES = 5;

  /* ------------------ SLOT DRAG ------------------ */

  startSlotDrag(event: PointerEvent, slot: PerformanceSlot) {
    if (this.drag.isDragging()) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();

    this.pointer.start(event);

    // keep to keep tracking the pointer even if it goes outside the slot element
    (event.target as HTMLElement)?.setPointerCapture(event.pointerId);

    //this.activePointerId = event.pointerId;
    //this.currentDrag = { type: 'slot', slot };
    this.drag.start({ type: 'slot', slot });

    this.dragStartY = event.clientY;
    this.originalStartMinutes = slot.startMinutes;
  }

  /* ------------------ SLOT RESIZE ------------------ */

  startSlotResize(event: PointerEvent, slot: PerformanceSlot) {
    if (this.drag.isDragging()) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();

    this.pointer.start(event);

    (event.target as HTMLElement)?.setPointerCapture(event.pointerId);

    this.drag.start({ type: 'resize', slot });

    this.resizeStartY = event.clientY;
    this.originalDuration = slot.duration;
  }

  /* ------------------ POINTER MOVE ------------------ */

  handlePointerMove(event: PointerEvent) {

    if (!this.pointer.isActivePointer(event)) {
      return;
    }

    const drag = this.drag.current();
    if (!drag) {
      return;
    }

    switch (drag.type) {

      case 'slot': {
        const slot = drag.slot;

        const deltaY = event.clientY - this.dragStartY;
        const deltaMinutes = deltaY / this.PIXELS_PER_MINUTE;

        const newMinutes =
          this.originalStartMinutes + deltaMinutes;

        const snapped =
          Math.round(newMinutes / this.SNAP_MINUTES) * this.SNAP_MINUTES;

        slot.startMinutes = Math.max(0, snapped);
        break;
      }

      case 'resize': {
        const slot = drag.slot;

        const deltaY = event.clientY - this.resizeStartY;
        const deltaMinutes = deltaY / this.PIXELS_PER_MINUTE;

        const newDuration =
          this.originalDuration + deltaMinutes;

        const snapped =
          Math.round(newDuration / this.SNAP_MINUTES) * this.SNAP_MINUTES;

        slot.duration =
          Math.max(this.SNAP_MINUTES, snapped);
        break;
      }

      // template / artist sont gérés dans le component
    }
  }

  /* ------------------ STOP ------------------ */

  stop() {
    this.drag.stop();
    this.pointer.stop();
  }
}
