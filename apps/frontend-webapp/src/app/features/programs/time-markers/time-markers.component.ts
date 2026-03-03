import { Component, Input } from '@angular/core';
import { timeToMinutes } from '../utils/timeToMinutes';
import { PIXELS_PER_MINUTE } from '../utils/PROGRAM_CONSTS';

@Component({
  selector: 'app-time-markers',
  imports: [],
  templateUrl: './time-markers.component.html',
  styleUrl: './time-markers.component.scss'
})
export class TimeMarkersComponent {
  @Input({ required: true }) totalMinutes: number = 0;
  @Input({ required: true }) programStart: string = '00:00';

  get timeMarkers(): number[] {
    const steps = Math.ceil(this.totalMinutes / 5);
    return Array.from({ length: steps + 1 }, (_, i) => i * 5);
  }

  get visibleTimeMarkers(): number[] {
    return this.timeMarkers.slice(1);
  }

  formatTime(offsetMinutes: number): string {

    const start = timeToMinutes(this.programStart);
    let absolute = start + offsetMinutes;

    absolute = absolute % (24 * 60);

    const hours = Math.floor(absolute / 60);
    const mins = absolute % 60;

    return `${hours}:${mins.toString().padStart(2, '0')}`;
  };

  /**
   * Calculate the pixel position for a given time offset in minutes.
   * This is used to position the time markers correctly on the timeline.
   * @param offsetMinutes
   */
  getPosition(offsetMinutes: number): number {
    return offsetMinutes * PIXELS_PER_MINUTE - this.gridOffsetPx;
  };

  /**
   * Calculate the pixel offset for the grid based on the program's start time.
   * This ensures that the time markers align correctly with the actual times.
   */
  get gridOffsetPx(): number {
    const startMinutes = timeToMinutes(this.programStart);
    const minuteWithinHour = startMinutes % 60;
    return minuteWithinHour * PIXELS_PER_MINUTE;
  }
}
