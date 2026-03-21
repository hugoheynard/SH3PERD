import { inject, Injectable } from '@angular/core';
import { DragSessionService } from '../../../../core/drag-and-drop/drag-session.service';
import { PlannerSelectorService } from '../selector-layer/planner-selector.service';
import { SlotSelectionService } from './slot-selection.service';
import { TimelineInteractionStore } from './timeline-interaction.store';
import { RoomLayoutRegistry } from '../room-layout-registry.service';
import { PlannerResolutionService } from '../planner-resolution.service';
import type { ArtistPerformanceSlot } from '../../program-types';
import { TimelineSpatialService } from '../timeline-spatial.service';
import { InsertLineService } from '../../timeline/insert-interaction-system/state-services/insert-line.service';


export type TSlotDragInteraction = {
  startY: number;
  grabOffset: number;
  slots: {
    slotId: string;
    offsetMinutes: number;
  }[];
};

@Injectable({ providedIn: 'root' })
export class SlotDragInteractionService {

  private drag = inject(DragSessionService);
  private selector = inject(PlannerSelectorService);
  private selection = inject(SlotSelectionService);
  private store = inject(TimelineInteractionStore);
  private layout = inject(RoomLayoutRegistry);
  private res = inject(PlannerResolutionService);
  private spatial = inject(TimelineSpatialService);
  private insertLine = inject(InsertLineService);

  private interaction: TSlotDragInteraction | null = null;

  /* ------------------ START ------------------ */

  start(event: PointerEvent, slot: ArtistPerformanceSlot) {

    this.drag.updatePointer(event);

    const slots = this.buildDragSlots(slot);

    this.startMultiDragPreview(slots);

    this.initPreviewStore(slots, slot);

    const grabOffset = this.computeGrabOffset(event, slot);

    if (grabOffset === null) return;

    this.interaction = {
      startY: event.clientY,
      grabOffset,
      slots
    };
  }

  move() {

    if (!this.interaction) {
      return;
    }

    const projection = this.spatial.projectPointer(
      this.interaction.grabOffset
    );

    if (!projection) {
      return;
    }

    const updates = this.interaction.slots.map(s => ({
      slotId: s.slotId,
      previewStart: projection.minutes + s.offsetMinutes,
      previewRoomId: projection.room_id
    }));

    this.store.update(updates);

  /**
  * 3️⃣ Update insert line (🔥 même source que le drag)
  */
    this.insertLine.set(
      projection.minutes,
      projection.room_id,
      false
    );
  };

  /* ------------------ HELPERS ------------------ */

  private buildDragSlots(slot: ArtistPerformanceSlot) {

    const selectedIds = this.selection.getSelectedIds();
    const slotsById = this.selector.slotsById();

    const activeSlots = selectedIds.includes(slot.id)
      ? selectedIds
      : [slot.id];

    const leaderStart = slot.startMinutes;

    return activeSlots.flatMap(id => {
      const s = slotsById.get(id);
      if (!s) {
        return [];
      }

      return [{
        slotId: s.id,
        offsetMinutes: s.startMinutes - leaderStart
      }];
    });
  }

  private initPreviewStore(
    slots: { slotId: string; offsetMinutes: number }[],
    leader: ArtistPerformanceSlot
  ) {

    const slotsById = this.selector.slotsById();

    this.store.start(
      slots.map(s => {
        const current = slotsById.get(s.slotId);

        return {
          slotId: s.slotId,
          base: current?.startMinutes ?? 0,
          roomId: current?.roomId ?? leader.roomId
        };
      })
    );
  }

  private computeGrabOffset(
    event: PointerEvent,
    slot: ArtistPerformanceSlot
  ): number | null {

    const rect = this.layout.getRect(slot.roomId);
    if (!rect) {
      return null;
    }

    const slotTopPx = this.res.minuteToPx(slot.startMinutes);
    const absoluteTop = rect.top + slotTopPx;

    return event.clientY - absoluteTop;
  }

  /* ------------------ STATE ------------------ */

  getInteraction() {
    return this.interaction;
  }

  isActive() {
    return !!this.interaction;
  }

  stop() {
    this.interaction = null;
  }

  private startMultiDragPreview(
    slots: { slotId: string; offsetMinutes: number }[]
  ) {

    const slotsById = this.selector.slotsById();

    const selectedSlots = slots
      .map(s => slotsById.get(s.slotId))
      .filter(Boolean) as ArtistPerformanceSlot[];

    this.drag.start({
      type: 'slot-multi',
      data: {
        slots: selectedSlots,
        offsets: slots
      }
    });
  }
}
