import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class PlannerResolutionService {

  pixelsPerMinute = signal(5);
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

  computePreviewTop(offsetY: number): number {

    const rawMinutes = this.pxToMinutes(offsetY);
    const snapped = this.snap(rawMinutes);

    return Math.max(0, this.minuteToPx(snapped));
  };

  computeGridOffset(startMinutes: number): number {

    const minuteWithinHour = startMinutes % 60;

    return this.minuteToPx(minuteWithinHour);
  };
}
