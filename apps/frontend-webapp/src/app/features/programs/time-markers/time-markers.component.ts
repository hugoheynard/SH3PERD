import { Component, inject } from '@angular/core';
import { time_functions_utils } from '../utils/time_functions_utils';
import { PIXELS_PER_MINUTE } from '../utils/PROGRAM_CONSTS';
import { ProgramStateService } from '../services/program-state.service';

@Component({
  selector: 'app-time-markers',
  imports: [],
  templateUrl: './time-markers.component.html',
  styleUrl: './time-markers.component.scss'
})
export class TimeMarkersComponent {
  private state = inject(ProgramStateService);
  totalMinutes = this.state.totalMinutes;
  programStart = this.state.startTime;

  get timeMarkers(): number[] {
    const steps = Math.ceil(this.totalMinutes() / 5);
    return Array.from({ length: steps + 1 }, (_, i) => i * 5);
  }

  get visibleTimeMarkers(): number[] {
    return this.timeMarkers.slice(1);
  }

  formatTime(offsetMinutes: number): string {

    const start = time_functions_utils(this.programStart());
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
    return offsetMinutes * PIXELS_PER_MINUTE;
  };

}
