import { inject, Injectable } from '@angular/core';
import { DragSessionService } from '../../../../core/drag-and-drop/drag-session.service';
import { PlannerSelectorService } from '../selector-layer/planner-selector.service';
import { SlotSelectionService } from './slot-selection.service';
import { TimelineInteractionStore } from './timeline-interaction.store';
import { RoomLayoutRegistry } from '../room-layout-registry.service';
import { PlannerResolutionService } from '../planner-resolution.service';
import type { ArtistPerformanceSlot } from '../../program-types';
import { InsertLineService } from '../../timeline/insert-interaction-system/state-services/insert-line.service';
import { SlotDragPreviewService } from './slot-drag-preview.service';
import { SlotDragBuilderService } from './slot-drag-builder.service';
import { InteractionContextService } from './interaction-context.service';


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
  private insertLine = inject(InsertLineService);
  private ctxService = inject(InteractionContextService);

  private preview = inject(SlotDragPreviewService);
  private builder = inject(SlotDragBuilderService);

  private interaction: TSlotDragInteraction | null = null;

  /* ------------------ START ------------------ */

  start(event: PointerEvent, slot: ArtistPerformanceSlot) {

    this.drag.updatePointer(event);

    const slots = this.builder.build(
      slot,
      this.selection.getSelectedIds(),
      this.selector.slotsById()
    );

    this.startMultiDragPreview(slots);

    this.initPreviewStore(slots, slot);

    const grabOffset = this.computeGrabOffset(event, slot);

    if (grabOffset === null) {
      return;
    }

    this.interaction = {
      startY: event.clientY,
      grabOffset,
      slots
    };
  }

  move() {

    const ctx = this.ctxService.getContext(this.interaction);

    if (!ctx) {
      return;
    }

    const { interaction, projection } = ctx;

    const updates = this.preview.computePreview(
      interaction,
      projection
    );

    this.store.update(updates);


    this.insertLine.set(
      projection.minutes,
      projection.room_id,
      false
    );
  };

  /* ------------------ HELPERS ------------------ */


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
