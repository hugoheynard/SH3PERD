import { computed, inject, Injectable } from '@angular/core';
import { ProgramStateService } from './program-state.service';
import { time_functions_utils } from '../utils/time_functions_utils';


/**
 * The PlannerSelectorService is an Angular service that provides computed properties for accessing various aspects of a program's state, such as its name, start and end times, staff, rooms, and slots.
 * It uses the ProgramStateService to retrieve the current program's data and calculates the total duration of the program in minutes based on the start and end times.
 * The service is designed to be injected into other components or services that require access to the program's state information.
 */
@Injectable({ providedIn: 'root' })
export class PlannerSelectorService {

  private state = inject(ProgramStateService);

  /* --------------------------------
            GETTERS / SELECTORS
   ----------------------------------*/
  name = computed(() => this.state.program().name);
  startTime = computed(() => this.state.program().startTime);
  endTime = computed(() => this.state.program().endTime);
  mode = computed(() => this.state.program().mode);
  staff = computed(() => this.state.program().artists);
  rooms = computed(() => this.state.program().rooms);
  slots = computed(() => this.state.program().slots);
  userGroups = computed(() => this.state.program().userGroups);


  /* --------------------------------
                 CALCULS
  -----------------------------------*/
  /**
   * Calculates the total duration of the program in minutes based on the start and end times.
   * It converts the start and end times from "HH:MM" format to total minutes using a utility function.
   * If the end time is earlier than or equal to the start time,
   * it assumes that the program extends past midnight and adds 24 hours (1440 minutes) to the end time before calculating the difference.
   * @returns total duration of the program in minutes
   */
  totalMinutes = computed(() => {
    const start = time_functions_utils(this.startTime());
    let end = time_functions_utils(this.endTime());

    if (end <= start) {
      end += 24 * 60;
    }

    return end - start;
  });
}
