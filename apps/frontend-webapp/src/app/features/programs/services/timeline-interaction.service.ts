import { inject, Injectable } from '@angular/core';
import { DragSessionService } from '../../../core/drag-and-drop/drag-session.service';
import { PlannerResolutionService } from './planner-resolution.service';
import { SlotService } from './planner-state-mutations/slot.service';
import type { ArtistPerformanceSlot } from '../program-types';
import { InsertLineService } from './insert-line.service';
import { SlotSelectionService } from './slot-selection.service';
import { PlannerSelectorService } from './planner-selector.service';
import { TimelineInteractionStore } from './timeline-interaction.store';
import { RoomLayoutRegistry } from './room-layout-registry.service';
import { TimelineSpatialService } from './timeline-spatial.service';

type InteractionState =
  | {
  type: 'slot'
  startY: number
  slots: {
    slotId: string
    offsetMinutes: number
  }[]
  grabOffset: number,
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
  private interactionStore = inject(TimelineInteractionStore);

  private interaction: InteractionState = null;

  /* ------------------ SLOT DRAG ------------------ */

  startSlotDrag(event: PointerEvent, slot: ArtistPerformanceSlot) {

    this.drag.updatePointer(event);

    const selectedIds = this.selection.getSelectedIds();
    const slotsById = this.selector.slotsById();

    /**
     * 1️⃣ Déterminer les slots concernés
     */
    const activeSlots = selectedIds.includes(slot.id)
      ? selectedIds
      : [slot.id];

    /**
     * 2️⃣ Construire les offsets RELATIFS AU SLOT LEADER
     */
    const leaderStart = slot.startMinutes;

    const slots = activeSlots.flatMap(id => {
      const s = slotsById.get(id);
      if (!s) {
        return [];
      }

      return [{
        slotId: s.id,
        offsetMinutes: s.startMinutes - leaderStart
      }];
    });

    /**
     * 3️⃣ Initialiser le preview store
     */
    this.interactionStore.start(
      slots.map(s => {
        const current = slotsById.get(s.slotId);
        return {
          slotId: s.slotId,
          base: current?.startMinutes ?? 0,
          roomId: current?.roomId ?? slot.roomId // fallback
        };
      })
    );

    /**
     * 4️⃣ Calcul du grabOffset (ULTRA IMPORTANT)
     */
    const rect = this.roomLayout.getRect(slot.roomId);
    if (!rect) return;

    const slotTopPx = this.res.minuteToPx(slot.startMinutes);

    const absoluteSlotTop = rect.top + slotTopPx;

    const grabOffset = event.clientY - absoluteSlotTop;

    /**
     * 5️⃣ Stock interaction
     */
    this.interaction = {
      type: 'slot',
      startY: event.clientY,
      grabOffset,
      slots,
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
  private spatial = inject(TimelineSpatialService);

  handlePointerMove() {

    if (!this.interaction) {
      return;
    }

    this.updateInsertLine();

    switch (this.interaction.type) {

      case 'slot': {

        const projection = this.spatial.projectPointer(this.interaction.grabOffset);

        if (!projection) {
          return;
        }

        const updates = this.interaction.slots.map(s => ({
          slotId: s.slotId,
          previewStart: projection.minutes + s.offsetMinutes,
          previewRoomId: projection.room_id
        }));


        this.interactionStore.update(updates);

        // 👉 insert line = même source
        this.insert.set(projection.minutes, projection.room_id, false);

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
    const dragging = this.interactionStore.draggingSlots();

    if (dragging) {
      dragging.forEach(s => {
        this.slotServ.updateSlotStart(
          s.slotId,
          s.previewStart
        );
      });
    }

    this.interactionStore.stop();
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

    const raw = baseMinutes + this.res.pxToMinutes(deltaY);
    const snapped = this.res.snap(raw);

    return Math.max(this.res.snapMinutes(), snapped);
  }

  private roomLayout = inject(RoomLayoutRegistry);

  private updateInsertLine() {

    const grabOffset =
      this.interaction?.type === 'slot'
        ? this.interaction.grabOffset
        : 0;

    const projection = this.spatial.projectPointer(grabOffset);

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
