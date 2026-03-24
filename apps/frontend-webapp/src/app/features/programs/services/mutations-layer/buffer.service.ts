import { inject, Injectable } from '@angular/core';
import { BaseTimelineItemCRUD } from './BaseTimelineItemCRUD';
import type { TimelineBuffer } from '../../program-types';
import { PlannerSelectorService } from '../selector-layer/planner-selector.service';
import { SlotService } from './slot.service';
import { PlannerResolutionService } from '../planner-resolution.service';

@Injectable({ providedIn: 'root' })
export class BufferService
  extends BaseTimelineItemCRUD<'timelineOffsets'>{

  constructor() {
    super('timelineOffsets')
  }

  private resolution = inject(PlannerResolutionService)

  createDefault(p: TimelineBuffer & { overrides?: Partial<TimelineBuffer> }
  ): TimelineBuffer {
    return {
      id: p.id,
      atMinutes: p.atMinutes,
      delta: p.delta,
      room_id: p.room_id,
      ...p.overrides
    }
  }

  private selector = inject(PlannerSelectorService);
  private slotService = inject(SlotService);

  applyRippleToRoom(
    roomId: string,
    at: number,
    delta: number
  ) {

    const slots = this.selector.slotsByRoom().get(roomId);

    if (!slots) {
      return;
    }

    // 1️⃣ Compute (immutable)
    const updates = slots
      .filter(slot => slot.startMinutes >= at)
      .map(slot => ({
        id: slot.id,
        startMinutes: slot.startMinutes + delta
      }));

    // 2️⃣ Apply (batch)
    this.slotService.updateManySlotsStart(updates);
  }


  updateBufferDuration(id: string, duration: number) {

    const snapped = Math.max(
      this.resolution.snapMinutes(),
      duration
    );

    this.patch(id, (buffer) => ({
      ...buffer,
      delta: snapped
    }));
  }

}
