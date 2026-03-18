import { inject, Injectable } from '@angular/core';
import { DragSessionService } from '../../../core/drag-and-drop/drag-session.service';
import { SlotService } from './planner-state-mutations/slot.service';
import type { ArtistPerformanceSlot } from '../program-types';
import { InsertLineService } from './insert-line.service';
import { TimelineInteractionStore } from './timeline-interaction.store';
import { SlotResizeInteractionService } from './slot-resize-interaction.service';
import { SlotDragInteractionService } from './slot-drag-interaction.service';
import { TimelineSpatialService } from './timeline-spatial.service';


@Injectable({ providedIn: 'root' })
export class TimelineInteractionService {

  private drag = inject(DragSessionService);
  private insert = inject(InsertLineService);
  private slotServ = inject(SlotService);

  private interactionStore = inject(TimelineInteractionStore);
  private resizeInteraction = inject(SlotResizeInteractionService);
  private dragInteraction = inject(SlotDragInteractionService);
  private spatial = inject(TimelineSpatialService);


  /* ------------------ SLOT DRAG ------------------ */

  startSlotDrag(event: PointerEvent, slot: ArtistPerformanceSlot) {
    this.dragInteraction.start(event, slot);
  };

  /* ------------------ SLOT RESIZE ------------------ */

  startSlotResize(event: PointerEvent, slot: ArtistPerformanceSlot) {
    this.resizeInteraction.start(event, slot);
  };

  /* ------------------ POINTER MOVE ------------------ */

  handlePointerMove() {

    const dragState = this.drag.current();

    const isSlotDrag = this.dragInteraction.isActive();
    const isResize = this.resizeInteraction.isActive();
    const isTemplateDrag = dragState?.type === 'template';

    if (!isSlotDrag && !isResize && !isTemplateDrag) {
      return;
    }

    // 👉 priorité : slot drag
    if (isSlotDrag) {
      this.dragInteraction.move();
      return;
    }

    // 👉 resize
    if (isResize) {
      this.resizeInteraction.move();
      return;
    }

    // 👉 template drag
    if (isTemplateDrag) {
      this.updateInsertLineForTemplate();
    }
  }


  /* ------------------ STOP ------------------ */

  stop() {

    // 👉 commit drag preview → state réel
    const dragging = this.interactionStore.draggingSlots();

    if (dragging) {
      dragging.forEach(s => {
        this.slotServ.updateSlotStart(
          s.slotId,
          s.previewStart
        );
      });
    }

    // 👉 reset tout
    this.interactionStore.stop();
    this.drag.stop();
    this.insert.clear();

    this.dragInteraction.stop();
    this.resizeInteraction.stop();
  }

  private updateInsertLineForTemplate() {

    const projection = this.spatial.projectPointer(0);

    if (!projection) {
      this.insert.clear();
      return;
    }

    this.insert.set(
      projection.minutes,
      projection.room_id,
      false
    );
  }
}
