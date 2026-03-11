import { inject, Injectable } from '@angular/core';
import { PointerTrackerService } from './drag-interactions/pointer-tracker.service';
import { DragSessionService} from './drag-interactions/drag-session.service';
import type { ArtistPerformanceSlot } from '../program-types';
import { PlannerResolutionService } from './planner-resolution.service';
import { SlotService } from './planner-state-mutations/slot.service';


@Injectable({ providedIn: 'root' })
export class TimelineInteractionService {
  private pointer = inject(PointerTrackerService);
  private drag = inject(DragSessionService);
  private res = inject(PlannerResolutionService);
  private slotServ = inject(SlotService);

  private dragStartY = 0;
  private resizeStartY = 0;
  private originalStartMinutes = 0;
  private originalDuration = 0;

  /* ------------------ SLOT DRAG ------------------ */

  startSlotDrag(event: PointerEvent, slot: ArtistPerformanceSlot) {

    if (!this.startInteraction(event)) {
      return;
    }

    this.drag.start({ type: 'slot', slot });

    this.dragStartY = event.clientY;
    this.originalStartMinutes = slot.startMinutes;
  };

  /* ------------------ SLOT RESIZE ------------------ */

  startSlotResize(event: PointerEvent, slot: ArtistPerformanceSlot) {

    if (!this.startInteraction(event)) {
      return;
    }

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

      /* ---------- SLOT MOVE ---------- */

      case 'slot': {

        const deltaY = event.clientY - this.dragStartY;
        const deltaMinutes = this.res.pxToMinutes(deltaY);
        const newMinutes = this.originalStartMinutes + deltaMinutes;
        const snapped = this.res.snap(newMinutes);

        this.slotServ.updateSlotStart(
          drag.slot.id,
          Math.max(0, snapped)
        );

        break;
      }

      /* ---------- SLOT RESIZE ---------- */

      case 'resize': {

        const deltaY = event.clientY - this.resizeStartY;

        const deltaMinutes = this.res.pxToMinutes(deltaY);

        const newDuration = this.originalDuration + deltaMinutes;

        const snapped =
          this.res.snap(newDuration);

        this.slotServ.updateSlotDuration(
          drag.slot.id,
          Math.max(this.res.snapMinutes(), snapped)
        );

        break;
      }
    }
  }

  /* ------------------ STOP ------------------ */

  stop() {
    this.drag.stop();
    this.pointer.stop();
  }

  /* ------------------ UTILS ------------------ */
  /**
   * Checks if a drag session is already active and returns true if so, preventing the start of a new interaction.
   * If no drag session is active, it prevents the default behavior and
   * ->stops propagation of the event,
   * ->starts tracking the pointer
   * ->captures the pointer for the event target.
   * This method is used to ensure that only one interaction (drag or resize) can be active at a time and to set up the necessary pointer tracking for the interaction.
   * @param event
   * @private
   */
  private startInteraction(event: PointerEvent): boolean {

    if (this.drag.isDragging()) {
      return false;
    }

    event.preventDefault();
    event.stopPropagation();

    this.pointer.start(event);

    (event.target as HTMLElement)?.setPointerCapture(event.pointerId);

    return true;
  }
}
