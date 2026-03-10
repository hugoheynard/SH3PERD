import { Component, computed, inject } from '@angular/core';
import { time_functions_utils } from '../utils/time_functions_utils';
import { ProgramStateService } from '../services/program-state.service';
import { PlannerResolutionService } from '../services/planner-resolution.service';

@Component({
  selector: 'app-time-markers',
  imports: [],
  templateUrl: './time-markers.component.html',
  styleUrl: './time-markers.component.scss'
})
export class TimeMarkersComponent {
  private state = inject(ProgramStateService);
  private res = inject(PlannerResolutionService);

  totalMinutes = this.state.totalMinutes;
  programStart = this.state.startTime;
  step = this.res.snapMinutes;

  timeMarkers = computed(() => {

    const total = this.totalMinutes();
    const step = this.step();

    const steps = Math.ceil(total / step);

    return Array.from({ length: steps + 1 }, (_, i) => i * step);

  });

  visibleTimeMarkers = computed(() =>
    this.timeMarkers().slice(1)
  );

  /**
   * Calculate the pixel position for a given time offset in minutes.
   * This is used to position the time markers correctly on the timeline.
   * @param offsetMinutes
   */
  getPosition(offsetMinutes: number) {
    return this.res.minuteToPx(offsetMinutes);
  };

  formatTime(offsetMinutes: number): string {

    const start = time_functions_utils(this.programStart());
    let absolute = start + offsetMinutes;

    absolute = absolute % (24 * 60);

    const hours = Math.floor(absolute / 60);
    const mins = absolute % 60;

    return `${hours}:${mins.toString().padStart(2, '0')}`;
  };
}
