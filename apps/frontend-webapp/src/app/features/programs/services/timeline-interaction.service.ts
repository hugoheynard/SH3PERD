import { inject, Injectable } from '@angular/core';
import { DragSessionService } from '../../../core/drag-and-drop/drag-session.service';
import { SlotService } from './planner-state-mutations/slot.service';
import type { ArtistPerformanceSlot } from '../program-types';
import { InsertLineService } from './insert-line.service';
import { TimelineInteractionStore } from './timeline-interaction.store';
import { SlotResizeInteractionService } from './slot-resize-interaction.service';
import { SlotDragInteractionService } from './slot-drag-interaction.service';


@Injectable({ providedIn: 'root' })
export class TimelineInteractionService {

  private drag = inject(DragSessionService);
  private insert = inject(InsertLineService);
  private slotServ = inject(SlotService);

  private interactionStore = inject(TimelineInteractionStore);
  private resizeInteraction = inject(SlotResizeInteractionService);
  private dragInteraction = inject(SlotDragInteractionService);


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

    const isDragging = this.dragInteraction.isActive();
    const isResizing = this.resizeInteraction.isActive();

    if (!isDragging && !isResizing) {
      return;
    }

    // 👉 DRAG
    this.dragInteraction.move();

    // 👉 RESIZE
    this.resizeInteraction.move();
  };


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
}
