import { Injectable } from '@angular/core';
import type { ArtistPerformanceSlot } from '../../program-types';

export type SlotPreview = {
  slot_id: string;
  previewStart: number;
  previewRoomId: string;
};

@Injectable({ providedIn: 'root' })
export class SlotDragConstraintService {

  /**
   * Applies strict "no overlap + gap-based movement" constraints.
   *
   * Ensures that:
   * - slots never overlap
   * - slots can jump across other slots
   * - placement always occurs inside valid gaps
   */
  applyStrictConstraints(
    preview: SlotPreview[],
    slotsById: Map<string, ArtistPerformanceSlot>,
    roomSlots: ArtistPerformanceSlot[]
  ): SlotPreview[] {

    const movingIds = new Set(preview.map(p => p.slot_id));

    return preview.map(p => {

      const original = slotsById.get(p.slot_id)!;

      const target = p.previewStart;

      /* ---------- STATIC SLOTS ---------- */

      const staticSlots = roomSlots
        .filter(s => !movingIds.has(s.id))
        .sort((a, b) => a.startMinutes - b.startMinutes);

      /* ---------- BUILD GAPS ---------- */

      const gaps: { start: number; end: number }[] = [];

      let cursor = 0;

      for (const slot of staticSlots) {

        if (slot.startMinutes > cursor) {
          gaps.push({
            start: cursor,
            end: slot.startMinutes
          });
        }

        cursor = slot.startMinutes + slot.duration;
      }

      gaps.push({
        start: cursor,
        end: Infinity
      });

      /* ---------- FIND BEST GAP ---------- */

      let bestStart = target;

      for (const gap of gaps) {

        const maxStart = gap.end - original.duration;

        if (target >= gap.start && target <= maxStart) {
          bestStart = target;
          break;
        }

        const clamped = Math.min(
          Math.max(target, gap.start),
          maxStart
        );

        if (
          Math.abs(clamped - target) <
          Math.abs(bestStart - target)
        ) {
          bestStart = clamped;
        }
      }

      return {
        ...p,
        previewStart: bestStart
      };
    });
  }
}
