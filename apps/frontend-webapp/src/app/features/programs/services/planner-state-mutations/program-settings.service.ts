import { inject, Injectable } from '@angular/core';
import type { ProgramMode } from '../../program-types';
import { ProgramHistoryService } from '../program-history.service';

@Injectable({ providedIn: 'root' })
export class ProgramSettingsService {

  private history = inject(ProgramHistoryService);


  changeProgramName(name: string) {
    this.history.updateState(state => ({
      ...state,
      name
    }));
  };

  /**
   * Times are in ISO format (e.g. "2024-06-01T12:00:00Z")
   * @param time
   */
  changeStartTime(time: string) {

    this.history.updateState(state => ({
      ...state,
      startTime: time
    }));
  };

  /**
   * Times are in ISO format (e.g. "2024-06-01T12:00:00Z")
   * @param time
   */
  changeEndTime(time: string) {
    this.history.updateState(state => ({
      ...state,
      endTime: time
    }));
  };

  /**
   * Changes the program mode to either "manual" or "assisted". The mode determines how the program is generated and managed. In "manual" mode, users have full control over the scheduling and organization of the program, while in "assisted" mode, the system may provide suggestions or automate certain aspects of the program creation process.
   * @param newMode
   */
  changeProgramMode(newMode: ProgramMode) {

    this.history.updateState(state => ({
      ...state,
      mode: newMode
    }));
  };
}
