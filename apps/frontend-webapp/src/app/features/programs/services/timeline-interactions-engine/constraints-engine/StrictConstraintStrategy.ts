import { Injectable } from '@angular/core';
import { SlotConstraintsKeys, type SlotConstraintStrategy } from './slot-drag-constraints-strategy.types';
import type { SlotPreview } from './slot-drag-constraints-engine';
import type { ArtistPerformanceSlot } from '../../../program-types';


@Injectable({ providedIn: 'root' })
export class StrictConstraintStrategy implements SlotConstraintStrategy {
  key = SlotConstraintsKeys.STRICT;

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

    const movingIds = new Set(preview.map(p => p.slot_id));

    return preview.map(p => {

      const moving = slotsById.get(p.slot_id);

      // 🔒 safety
      if (!moving || typeof moving.duration !== 'number') {
        console.warn('Invalid slot', p.slot_id, moving);
        return p;
      }

      const target = p.previewStart;

      const staticSlots = roomSlots
        .filter(s => !movingIds.has(s.id))
        .sort((a, b) => a.startMinutes - b.startMinutes);

      /* ---------- NO STATIC ---------- */

      if (staticSlots.length === 0) {
        return {
          ...p,
          previewStart: Math.max(0, target)
        };
      }

      /* ---------- BEFORE FIRST ---------- */

      const first = staticSlots[0];

      if (target + moving.duration <= first.startMinutes) {
        return {
          ...p,
          previewStart: Math.max(0, target)
        };
      }

      if (target < first.startMinutes) {
        return {
          ...p,
          previewStart: first.startMinutes - moving.duration
        };
      }

      /* ---------- BETWEEN ---------- */

      for (let i = 0; i < staticSlots.length - 1; i++) {

        const a = staticSlots[i];
        const b = staticSlots[i + 1];

        const gapStart = a.startMinutes + a.duration;
        const gapEnd = b.startMinutes;
        const gapSize = gapEnd - gapStart;

        // ✅ GAP SUFFISANT
        if (gapSize >= moving.duration) {

          // fit parfait
          if (
            target >= gapStart &&
            target + moving.duration <= gapEnd
          ) {
            return {
              ...p,
              previewStart: target
            };
          }

          // snap début gap
          if (target < gapStart) {
            return {
              ...p,
              previewStart: gapStart
            };
          }

          // snap fin gap
          if (target > gapEnd) {
            return {
              ...p,
              previewStart: gapEnd - moving.duration
            };
          }
        }

        // ❌ GAP TROP PETIT → IGNORE + PUSH APRÈS B
        else {

          if (target < gapEnd) {
            return {
              ...p,
              previewStart: b.startMinutes + b.duration // 🔥 FIX CRITIQUE
            };
          }
        }
      }

      /* ---------- AFTER LAST ---------- */

      const last = staticSlots[staticSlots.length - 1];

      const lastEnd = last.startMinutes + last.duration;

      return {
        ...p,
        previewStart: Math.max(target, lastEnd)
      };
    });
  }
}
