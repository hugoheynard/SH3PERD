import { Injectable } from '@angular/core';
import type {
  Artist,
  PerformanceSlot,
  PerformanceTemplate
} from './program-state.service';

@Injectable({ providedIn: 'root' })
export class TimelineInteractionService {

  private activePointerId?: number;
  currentDrag?: DragState;

  private dragStartY = 0;
  private originalStartMinutes = 0;

  private resizeStartY = 0;
  private originalDuration = 0;

  readonly PIXELS_PER_MINUTE = 5;
  readonly SNAP_MINUTES = 5;

  /* ------------------ SLOT DRAG ------------------ */

  startSlotDrag(event: PointerEvent, slot: PerformanceSlot) {
    event.preventDefault();
    event.stopPropagation();

    // Capture du pointer pour garder le contrôle même hors élément
    (event.target as HTMLElement)?.setPointerCapture(event.pointerId);

    this.activePointerId = event.pointerId;
    this.currentDrag = { type: 'slot', slot };

    this.dragStartY = event.clientY;
    this.originalStartMinutes = slot.startMinutes;
  }

  /* ------------------ SLOT RESIZE ------------------ */

  startSlotResize(event: PointerEvent, slot: PerformanceSlot) {
    event.preventDefault();
    event.stopPropagation();

    (event.target as HTMLElement)?.setPointerCapture(event.pointerId);

    this.activePointerId = event.pointerId;
    this.currentDrag = { type: 'resize', slot };

    this.resizeStartY = event.clientY;
    this.originalDuration = slot.duration;
  }

  /* ------------------ POINTER MOVE ------------------ */

  handlePointerMove(event: PointerEvent) {

    if (!this.currentDrag) return;

    // On vérifie le pointerId uniquement pour slot/resize
    if (
      (this.currentDrag.type === 'slot' ||
        this.currentDrag.type === 'resize') &&
      event.pointerId !== this.activePointerId
    ) {
      return;
    }

    switch (this.currentDrag.type) {

      case 'slot': {
        const slot = this.currentDrag.slot;

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
        const slot = this.currentDrag.slot;

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
    this.currentDrag = undefined;
    this.activePointerId = undefined;
  }
}

/* ---------------------------------------------------
   DRAG STATE TYPE
--------------------------------------------------- */

export type DragState =
  | { type: 'template'; template: PerformanceTemplate }
  | { type: 'artist'; artist: Artist }
  | { type: 'slot'; slot: PerformanceSlot }
  | { type: 'resize'; slot: PerformanceSlot };
