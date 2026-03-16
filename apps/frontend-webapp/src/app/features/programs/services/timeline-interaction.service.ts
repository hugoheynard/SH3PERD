import { inject, Injectable } from '@angular/core';
import { DragSessionService } from '../../../core/drag-and-drop/drag-session.service';
import { PlannerResolutionService } from './planner-resolution.service';
import { SlotService } from './planner-state-mutations/slot.service';
import type { ArtistPerformanceSlot } from '../program-types';
import { InsertLineService } from './insert-line.service';
import { SlotSelectionService } from './slot-selection.service';
import { PlannerSelectorService } from './planner-selector.service';

type InteractionState =
  | {
  type: 'slot'
  startY: number
  slots: {
    slotId: string
    baseMinutes: number
  }[]
}
  | {
  type: 'resize'
  startY: number
  baseMinutes: number
  slotId: string
}
  | null;

@Injectable({ providedIn: 'root' })
export class TimelineInteractionService {

  private drag = inject(DragSessionService);
  private res = inject(PlannerResolutionService);
  private insert = inject(InsertLineService);
  private slotServ = inject(SlotService);
  private selection = inject(SlotSelectionService);
  private selector = inject(PlannerSelectorService);

  private interaction: InteractionState = null;

  /* ------------------ SLOT DRAG ------------------ */

  startSlotDrag(event: PointerEvent, slot: ArtistPerformanceSlot) {

    this.drag.updatePointer(event);

    const selectedIds = this.selection.getSelectedIds();
    const slotsById = this.selector.slotsById();

    const slots =
      selectedIds.includes(slot.id)
        ? selectedIds
          .flatMap(id => {
            const s = slotsById.get(id);
            return s
              ? [{ slotId: s.id, baseMinutes: s.startMinutes }]
              : [];
          })
        : [{
          slotId: slot.id,
          baseMinutes: slot.startMinutes
        }];

    this.interaction = {
      type: 'slot',
      startY: event.clientY,
      slots
    };

  }

  /* ------------------ SLOT RESIZE ------------------ */

  startSlotResize(event: PointerEvent, slot: ArtistPerformanceSlot) {

    if (this.drag.isDragging()) {
      return;
    }

    this.drag.updatePointer(event);

    event.preventDefault();
    event.stopPropagation();

    this.drag.start({ type: 'resize', data: slot });

    (event.target as HTMLElement)?.setPointerCapture(event.pointerId);

    this.interaction = {
      type: 'resize',
      startY: event.clientY,
      baseMinutes: slot.duration,
      slotId: slot.id
    };

  }

  /* ------------------ POINTER MOVE ------------------ */

  handlePointerMove() {

    if (!this.interaction) {
      return;
    }

    switch (this.interaction.type) {

      case 'slot': {

        const deltaY = this.drag.cursorY() - this.interaction.startY;

        const deltaMinutes = this.res.pxToMinutes(deltaY);

        this.interaction.slots.forEach(s => {

          const snapped = this.res.snap(s.baseMinutes + deltaMinutes);

          this.slotServ.updateSlotStart(
            s.slotId,
            Math.max(0, snapped)
          );

        });

        break;
      }

      case 'resize': {

        const minutes = this.computeMinutes(
          this.interaction.startY,
          this.interaction.baseMinutes
        );

        this.slotServ.updateSlotDuration(
          this.interaction.slotId,
          Math.max(this.res.snapMinutes(), minutes)
        );

        break;
      }
    }
  }


  /* ------------------ STOP ------------------ */

  stop() {
    this.drag.stop();
    this.insert.clear();
    this.interaction = null;
  };

  /* ------------------ UTILS/HELPERS ------------------ */
  /**
   * helper
   * @param startY
   * @param baseMinutes
   * @private
   */
  private computeMinutes(startY: number, baseMinutes: number) {
    const deltaY = this.drag.cursorY() - startY;
    const deltaMinutes = this.res.pxToMinutes(deltaY);

    return this.res.snap(baseMinutes + deltaMinutes);
  };
}
