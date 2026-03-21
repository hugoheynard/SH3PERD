import { Injectable } from '@angular/core';
import { SlotConstraintsKeys, type SlotConstraintStrategy } from './slot-drag-constraints-strategy.types';
import type { SlotPreview } from './slot-drag-constraints-engine';
import type { ArtistPerformanceSlot } from '../../../program-types';


@Injectable({ providedIn: 'root' })
export class RippleConstraintStrategy implements SlotConstraintStrategy {

  key = SlotConstraintsKeys.RIPPLE;

  apply(
    preview: SlotPreview[],
    {
      slotsById,
      roomSlots
    }: {
      slotsById: Map<string, ArtistPerformanceSlot>;
      roomSlots: ArtistPerformanceSlot[];
    }
  ): SlotPreview[] {

    if (preview.length === 0) return preview;

    const movingIds = new Set(preview.map(p => p.slot_id));

    // 🔥 moving (leader)
    const moving = preview.map(p => {
      const slot = slotsById.get(p.slot_id)!;

      return {
        id: p.slot_id,
        start: p.previewStart,
        duration: slot.duration
      };
    });

    // 🔥 static
    const staticSlots = roomSlots
      .filter(s => !movingIds.has(s.id))
      .map(s => ({
        id: s.id,
        start: s.startMinutes,
        duration: s.duration
      }));

    // 🔥 merge
    const all = [...staticSlots, ...moving]
      .sort((a, b) => a.start - b.start);

    // 🔥 ripple push (forward only)
    for (let i = 0; i < all.length; i++) {

      const current = all[i];

      for (let j = i + 1; j < all.length; j++) {

        const next = all[j];

        const currentEnd = current.start + current.duration;

        if (next.start < currentEnd) {
          next.start = currentEnd;
        }
      }
    }

    // 🔥 retourner uniquement les moving slots
    return preview.map(p => {

      const updated = all.find(s => s.id === p.slot_id)!;

      return {
        ...p,
        previewStart: updated.start
      };
    });
  }
}
