import { computed, inject, Injectable } from '@angular/core';
import type { WorkloadSegment } from '../artist-workload-strip/artist-workload-strip.component';
import { PlannerSelectorService } from './selector-layer/planner-selector.service';

export interface ArtistWorkload {
  segments: WorkloadSegment[];
  totalMinutes: number;
  score: number;
  firstStart: number;
  lastEnd: number;
}

@Injectable({ providedIn: 'root' })
export class WorkloadService {

  private selector = inject(PlannerSelectorService);

  artistWorkloadMap = computed(() => {

    const slots = this.selector.slots();

    const map = new Map<string, ArtistWorkload>();

    for (const slot of slots) {

      const start = slot.startMinutes;
      const end = start + slot.duration;

      for (const artist of slot.artists) {

        const segment = {
          start,
          duration: slot.duration,
          color: slot.color,
          score: slot.loadScore ?? 1
        };

        const prev = map.get(artist.id);

        const next: ArtistWorkload = prev
          ? {
            segments: [...prev.segments, segment],
            totalMinutes: prev.totalMinutes + slot.duration,
            score: prev.score + slot.duration * (slot.loadScore ?? 1),
            firstStart: Math.min(prev.firstStart, start),
            lastEnd: Math.max(prev.lastEnd, end)
          }
          : {
            segments: [segment],
            totalMinutes: slot.duration,
            score: slot.duration * (slot.loadScore ?? 1),
            firstStart: start,
            lastEnd: end
          };

        map.set(artist.id, next);
      }
    }

    return map;
  });
}
