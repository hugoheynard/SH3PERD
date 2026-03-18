import { inject, Injectable } from '@angular/core';
import { DragSessionService } from '../../../core/drag-and-drop/drag-session.service';
import { PlannerResolutionService } from './planner-resolution.service';
import { SlotService } from './planner-state-mutations/slot.service';
import type { ArtistPerformanceSlot } from '../program-types';


export type TResizeInteraction = {
  startY: number;
  baseMinutes: number;
  slotId: string;
};


@Injectable({ providedIn: 'root' })
export class SlotResizeInteractionService {

  private drag = inject(DragSessionService);
  private res = inject(PlannerResolutionService);
  private slotServ = inject(SlotService);

  private interaction: TResizeInteraction | null = null;

  /* ------------------ START ------------------ */

  start(event: PointerEvent, slot: ArtistPerformanceSlot) {

    if (this.drag.isDragging()) {
      return;
    }

    this.drag.updatePointer(event);

    event.preventDefault();
    event.stopPropagation();

    this.drag.start({ type: 'resize', data: slot });

    (event.target as HTMLElement)?.setPointerCapture(event.pointerId);

    this.interaction = {
      startY: event.clientY,
      baseMinutes: slot.duration,
      slotId: slot.id
    };
  };

  /* ------------------ MOVE ------------------ */

  move() {

    if (!this.interaction) {
      return;
    }

    const deltaY = this.drag.cursorY() - this.interaction.startY;

    const raw = this.interaction.baseMinutes + this.res.pxToMinutes(deltaY);
    const snapped = this.res.snap(raw);

    this.slotServ.updateSlotDuration(
      this.interaction.slotId,
      Math.max(this.res.snapMinutes(), snapped)
    );
  };

  /* ------------------ STOP ------------------ */

  stop() {
    this.interaction = null;
  };

  /* ------------------ STATE ------------------ */

  isActive() {
    return !!this.interaction;
  };
}
