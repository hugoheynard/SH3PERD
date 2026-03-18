import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class TimelineCollisionService {

  resolve(slots: {
    id: string;
    start: number;
    duration: number;
  }[]) {

    const sorted = [...slots].sort((a, b) => a.start - b.start);

    for (let i = 1; i < sorted.length; i++) {

      const prev = sorted[i - 1];
      const curr = sorted[i];

      const prevEnd = prev.start + prev.duration;

      if (curr.start < prevEnd) {
        curr.start = prevEnd;
      }
    }

    return sorted;
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
