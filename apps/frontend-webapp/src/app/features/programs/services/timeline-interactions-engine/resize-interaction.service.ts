import { inject, Injectable } from '@angular/core';
import { DragSessionService } from '../../../../core/drag-and-drop/drag-session.service';
import { PlannerResolutionService } from '../planner-resolution.service';
import { SlotService } from '../mutations-layer/slot.service';
import { type ResizeTarget, ResizeTargetType } from '../../../../core/drag-and-drop/drag.types';
import { BufferService } from '../mutations-layer/buffer.service';


export type TResizeInteraction = {
  startY: number;
  baseMinutes: number;
  target: ResizeTarget;
};


@Injectable({ providedIn: 'root' })
export class ResizeInteractionService {

  private drag = inject(DragSessionService);
  private res = inject(PlannerResolutionService);
  private slotServ = inject(SlotService);
  private bufferServ = inject(BufferService);


  private interaction: TResizeInteraction | null = null;

  /* ------------------ START ------------------ */

  start(event: PointerEvent, target: ResizeTarget) {

    if (this.drag.isDragging()) {
      return;
    }

    this.drag.updatePointer(event);

    event.preventDefault();
    event.stopPropagation();

    this.drag.start({ type: 'resize', data: target });

    (event.target as HTMLElement)?.setPointerCapture(event.pointerId);

    this.interaction = {
      startY: event.clientY,
      baseMinutes: target.duration,
      target
    };
  }

  /* ------------------ MOVE ------------------ */

  move() {

    if (!this.interaction) {
      return;
    }

    const { target, startY, baseMinutes } = this.interaction;

    const deltaY = this.drag.cursorY() - startY;

    const raw = baseMinutes + this.res.pxToMinutes(deltaY);
    const snapped = this.res.snap(raw);
    const duration = Math.max(this.res.snapMinutes(), snapped);

    this.applyResize(target, duration);
  }

  /* ------------------ STOP ------------------ */

  stop() {
    this.interaction = null;
  };

  /* ------------------ STATE ------------------ */

  isActive() {
    return !!this.interaction;
  };

  //METIER
  private applyResize(target: ResizeTarget, duration: number) {

    switch (target.type) {

      case ResizeTargetType.SLOT:
        this.slotServ.updateSlotDuration(target.id, duration);
        break;

      case ResizeTargetType.BUFFER:
        this.bufferServ.updateBufferDuration(target.id, duration);
        break;
    }
  }
}
