import { inject, Injectable } from '@angular/core';
import { DragSessionService } from '../../../../core/drag-and-drop/drag-session.service';
import { PlannerSelectorService } from '../selector-layer/planner-selector.service';
import { SlotSelectionService } from './element-selection/slot-selection.service';
import { TimelineInteractionStore } from './timeline-interaction.store';
import { RoomLayoutRegistry } from '../room-layout-registry.service';
import { PlannerResolutionService } from '../planner-resolution.service';
import type { ArtistPerformanceSlot } from '../../program-types';
import { InsertLineService } from '../../timeline/insert-interaction-system/state-services/insert-line.service';
import { SlotDragPreviewService } from './slot-drag-preview.service';
import { SlotDragBuilderService } from './slot-drag-builder.service';
import { InteractionContextService } from './interaction-context.service';
import { SlotConstraintEngine } from './constraints-engine/slot-drag-constraints-engine';
import { SlotConstraintsKeys } from './constraints-engine/slot-drag-constraints-strategy.types';


export type TSlotDragInteraction = {
  startY: number;
  grabOffset: number;
  slots: {
    slot_id: string;
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
  private constraint = inject(SlotConstraintEngine);

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
    if (!ctx) return;

    /* ---------- RAW PREVIEW ---------- */

    const raw = this.preview.computePreview(
      ctx.interaction,
      ctx.projection
    );

    /* ---------- CONSTRAINTS ---------- */
    this.constraint.setStrategy(SlotConstraintsKeys.STRICT);

    const constrained = this.constraint.apply(
      raw, {
        slotsById: this.selector.slotsById(),
        roomSlots: this.selector.slotsByRoom().get(ctx.projection.room_id) ?? []
      }
    );


    /* ---------- APPLY ---------- */

    this.store.update(constrained);

    this.insertLine.set(
      ctx.projection.minutes,
      ctx.projection.room_id,
      false
    );
  }

  /* ------------------ HELPERS ------------------ */


  private initPreviewStore(
    slots: { slot_id: string; offsetMinutes: number }[],
    leader: ArtistPerformanceSlot
  ) {

    const slotsById = this.selector.slotsById();

    this.store.start(
      slots.map(s => {
        const current = slotsById.get(s.slot_id);

        return {
          slot_id: s.slot_id,
          previewStart: current?.startMinutes ?? 0,
          previewRoomId: current?.room_id ?? leader.room_id
        };
      })
    );
  }

  private computeGrabOffset(
    event: PointerEvent,
    slot: ArtistPerformanceSlot
  ): number | null {

    const rect = this.layout.getRect(slot.room_id);
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
    slots: { slot_id: string; offsetMinutes: number }[]
  ) {

    const slotsById = this.selector.slotsById();

    const selectedSlots = slots
      .map(s => slotsById.get(s.slot_id))
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
