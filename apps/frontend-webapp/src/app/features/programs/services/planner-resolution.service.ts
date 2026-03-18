import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class PlannerResolutionService {

  /**
   * determines the size of a minute into the timeline.
   */
  pixelsPerMinute = signal(5);

  /**
   * determines interval size of the timeline subdivisions in minutes (base = 5);
   */
  snapMinutes = signal(5);

  minuteToPx(minutes: number): number {
    return minutes * this.pixelsPerMinute();
  };

  pxToMinutes(px: number): number {
    return px / this.pixelsPerMinute();
  };

  snap(minutes: number): number {
    const step = this.snapMinutes();
    return Math.round(minutes / step) * step;
  };









  computePreviewTop(offsetY: number, gridOffsetPx: number): number {
    const correctedPx = offsetY + gridOffsetPx;

    const rawMinutes = this.pxToMinutes(correctedPx);
    const snapped = this.snap(rawMinutes);

    return this.minuteToPx(snapped) - gridOffsetPx;
  };

  computeGridOffset(startMinutes: number): number {
    const minuteWithinHour = startMinutes % 60;
    return this.minuteToPx(minuteWithinHour);
  };
}
