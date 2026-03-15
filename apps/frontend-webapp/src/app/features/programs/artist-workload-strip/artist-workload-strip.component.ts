import { Component, computed, input, } from '@angular/core';

export interface WorkloadSegment {
  start: number;      // minutes absolues (depuis début programme)
  duration: number;   // minutes
  color: string;      // couleur du slot
  score: number;      // intensité 0–100
}

/**
 * graphic representation of the artist workload, related to state slots
 */
@Component({
  selector: 'app-artist-workload-strip',
  imports: [],
  templateUrl: './artist-workload-strip.component.html',
  styleUrl: './artist-workload-strip.component.scss'
})
export class ArtistWorkloadStripComponent {
  segments = input<WorkloadSegment[]>([]);
  globalScore = input<number>(0);

  // ---- Computed active range ----

  firstStart = computed(() => {
    if (!this.segments().length) {
      return 0;
    }
    return Math.min(...this.segments().map(s => s.start));
  });

  lastEnd = computed(() => {
    if (!this.segments().length) {
      return 0;
    }
    return Math.max(...this.segments().map(s => s.start + s.duration));
  });

  activeRange = computed(() => {
    return this.lastEnd() - this.firstStart();
  });

  totalWorkedMinutes = computed(() =>
    this.segments().reduce((acc, s) => acc + s.duration, 0)
  );

  // ---- Normalize segments ----

  normalizedSegments = computed(() => {
    const first = this.firstStart();
    const range = this.activeRange();

    if (!range) return [];

    return this.segments().map(segment => ({
      left: ((segment.start - first) / range) * 100,
      width: (segment.duration / range) * 100,
      color: segment.color,
      opacity: 0.4 + (segment.score / 100) * 0.6
    }));
  });

  // ---- Gaps (trous grisés) ----

  gaps = computed(() => {
    if (!this.segments().length) {
      return [];
    }

    const sorted = [...this.segments()].sort((a, b) => a.start - b.start);
    const gaps: { left: number; width: number }[] = [];

    const first = this.firstStart();
    const range = this.activeRange();

    for (let i = 0; i < sorted.length - 1; i++) {
      const currentEnd = sorted[i].start + sorted[i].duration;
      const nextStart = sorted[i + 1].start;

      if (nextStart > currentEnd) {
        const gapStart = currentEnd;
        const gapDuration = nextStart - currentEnd;

        gaps.push({
          left: ((gapStart - first) / range) * 100,
          width: (gapDuration / range) * 100
        });
      }
    }

    return gaps;
  });
}
