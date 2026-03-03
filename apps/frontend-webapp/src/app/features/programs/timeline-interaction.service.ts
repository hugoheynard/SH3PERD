import { Injectable } from '@angular/core';
import type { PerformanceSlot } from './program-state.service';


@Injectable({
  providedIn: 'root'
})
export class TimelineInteractionService {
  private draggingSlot?: PerformanceSlot;
  private dragStartY = 0;
  private originalStartMinutes = 0;

  readonly PIXELS_PER_MINUTE = 5;
  readonly SNAP_MINUTES = 5;

  startSlotDrag(event: MouseEvent, slot: PerformanceSlot) {
    event.preventDefault();
    event.stopPropagation();

    this.draggingSlot = slot;
    this.dragStartY = event.clientY;
    this.originalStartMinutes = slot.startMinutes;
  }

  handleMouseMove(event: MouseEvent) {

    // DRAG
    if (this.draggingSlot) {

      const deltaY = event.clientY - this.dragStartY;
      const deltaMinutes = deltaY / this.PIXELS_PER_MINUTE;

      const newMinutes =
        this.originalStartMinutes + deltaMinutes;

      const snapped =
        Math.round(newMinutes / this.SNAP_MINUTES) * this.SNAP_MINUTES;

      this.draggingSlot.startMinutes =
        Math.max(0, snapped);
    }

    // --- RESIZE ---
    if (this.resizingSlot) {

      const deltaY = event.clientY - this.resizeStartY;
      const deltaMinutes = deltaY / this.PIXELS_PER_MINUTE;

      const newDuration =
        this.originalDuration + deltaMinutes;

      const snapped =
        Math.round(newDuration / this.SNAP_MINUTES) * this.SNAP_MINUTES;

      this.resizingSlot.duration =
        Math.max(this.SNAP_MINUTES, snapped);
    }
  };

  /**
   * Call this method to stop any ongoing drag or resize operation.
    * It resets the internal state of the service, allowing for new interactions to start fresh.
   */
  stop() {
    this.draggingSlot = undefined;
    this.resizingSlot = undefined;
  };

  get currentDraggingSlot() {
    return this.draggingSlot;
  }


  /* --------------------------------
      RESIZE SLOT
   ----------------------------*/
  private resizingSlot?: PerformanceSlot;
  private resizeStartY = 0;
  private originalDuration = 0;

  startSlotResize(event: MouseEvent, slot: PerformanceSlot) {
    event.preventDefault();
    event.stopPropagation();

    this.resizingSlot = slot;
    this.resizeStartY = event.clientY;
    this.originalDuration = slot.duration;
  }
}
