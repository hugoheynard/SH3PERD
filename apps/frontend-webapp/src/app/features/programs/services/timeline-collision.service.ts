import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class TimelineCollisionService {

  resolve(
    slots: {
      id: string;
      start: number;
      duration: number;
    }[],
    movingIds: Set<string>
  ) {

    const moving = slots
      .filter(s => movingIds.has(s.id))
      .sort((a, b) => a.start - b.start);

    const staticSlots = slots
      .filter(s => !movingIds.has(s.id))
      .sort((a, b) => a.start - b.start);

    const result: typeof slots = [];

    let cursor = 0;

    const all = [...staticSlots, ...moving]
      .sort((a, b) => a.start - b.start);

    for (const slot of all) {

      const duration = slot.duration;

      const start = Math.max(slot.start, cursor);

      result.push({
        ...slot,
        start
      });

      cursor = start + duration;
    }

    return result;
  }

  resolveWithAnticipation(slots: {
    id: string;
    start: number;
    duration: number;
  }[]) {

    const sorted = [...slots].sort((a, b) => a.start - b.start);

    for (let i = 1; i < sorted.length; i++) {

      const prev = sorted[i - 1];
      const curr = sorted[i];

      const prevEnd = prev.start + prev.duration;

      const anticipation = prev.duration * 0.3;

      if (curr.start < prevEnd + anticipation) {
        curr.start = prevEnd;
      }
    }

    return sorted;
  }
}
