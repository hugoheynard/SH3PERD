import { inject, Injectable } from '@angular/core';
import { DragSessionService } from '../../../core/drag-and-drop/drag-session.service';
import { PlannerResolutionService } from './planner-resolution.service';
import { SlotService } from './planner-state-mutations/slot.service';
import type { ArtistPerformanceSlot } from '../program-types';

@Injectable({ providedIn: 'root' })
export class TimelineInteractionService {

  private drag = inject(DragSessionService);
  private res = inject(PlannerResolutionService);
  private slotServ = inject(SlotService);

  private dragStartY = 0;
  private resizeStartY = 0;
  private originalStartMinutes = 0;
  private originalDuration = 0;

  /* ------------------ SLOT DRAG ------------------ */

  startSlotDrag(event: PointerEvent, data: ArtistPerformanceSlot) {

    this.dragStartY = event.clientY;
    this.originalStartMinutes = data.startMinutes;

  }

  /* ------------------ SLOT RESIZE ------------------ */

  startSlotResize(event: PointerEvent, data: ArtistPerformanceSlot) {

    if (this.drag.isDragging()) return;

    event.preventDefault();
    event.stopPropagation();

    this.drag.start({ type: 'resize', data });

    (event.target as HTMLElement)?.setPointerCapture(event.pointerId);

    this.resizeStartY = event.clientY;
    this.originalDuration = data.duration;

  }

  /* ------------------ POINTER MOVE ------------------ */

  handlePointerMove() {

    const drag = this.drag.current();
    if (!drag) return;

    const cursorY = this.drag.cursorY();

    switch (drag.type) {

      case 'slot': {

        const deltaY = cursorY - this.dragStartY;

        const deltaMinutes = this.res.pxToMinutes(deltaY);

        const newMinutes = this.originalStartMinutes + deltaMinutes;

        const snapped = this.res.snap(newMinutes);

        this.slotServ.updateSlotStart(
          drag.data.id,
          Math.max(0, snapped)
        );

        break;
      }

      case 'resize': {

        const deltaY = cursorY - this.resizeStartY;

        const deltaMinutes = this.res.pxToMinutes(deltaY);

        const newDuration = this.originalDuration + deltaMinutes;

        const snapped = this.res.snap(newDuration);

        this.slotServ.updateSlotDuration(
          drag.data.id,
          Math.max(this.res.snapMinutes(), snapped)
        );

        break;
      }
    }
  }

  /* ------------------ STOP ------------------ */

  stop() {
    this.drag.stop();
  }

}
