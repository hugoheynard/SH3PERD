import { Injectable } from '@angular/core';
import type { ArtistPerformanceSlot } from '../../program-types';

@Injectable({ providedIn: 'root' })
export class SlotDragBuilderService {

  build(
    slot: ArtistPerformanceSlot,
    selectedIds: string[],
    slotsById: Map<string, ArtistPerformanceSlot>
  ) {

    const activeSlots = selectedIds.includes(slot.id)
      ? selectedIds
      : [slot.id];

    const leaderStart = slot.startMinutes;

    return activeSlots.flatMap(id => {
      const s = slotsById.get(id);
      if (!s) return [];

      return [{
        slotId: s.id,
        offsetMinutes: s.startMinutes - leaderStart
      }];
    });
  }
}
