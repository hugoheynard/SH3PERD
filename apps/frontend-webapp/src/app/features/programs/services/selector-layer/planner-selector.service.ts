import { computed, inject, Injectable } from '@angular/core';
import { ProgramStateService } from '../program-state.service';
import type { ArtistPerformanceSlot } from '../../program-types';
import { CueSelectorsService } from './cue-selector.service';
import { SlotSelectorService } from './slot-selector.service';
import { TimelineSelectorsService } from './timeline-selector.service';


/**
 * The PlannerSelectorService is an Angular service that provides computed properties for accessing various aspects of a program's state, such as its name, start and end times, staff, rooms, and slots.
 * It uses the ProgramStateService to retrieve the current program's data and calculates the total duration of the program in minutes based on the start and end times.
 * The service is designed to be injected into other components or services that require access to the program's state information.
 * TODO: NEW JS DOC, DESCRIBE AS A FACADE
 */
@Injectable({ providedIn: 'root' })
export class PlannerSelectorService {

  private state = inject(ProgramStateService);

  /* ----------------GETTERS / SELECTORS -----------------------------*/
  name = computed(() => this.state.program().name);
  startTime = computed(() => this.state.program().startTime);
  endTime = computed(() => this.state.program().endTime);
  mode = computed(() => this.state.program().mode);
  staff = computed(() => this.state.program().artists);
  rooms = computed(() => this.state.program().rooms);
  userGroups = computed(() => this.state.program().userGroups);
  timelineOffsets = computed(() => this.state.program().timelineOffsets);


  //-------------------- TIMELINE ----------------------------------//
  private timelineSelectors = inject(TimelineSelectorsService);

  totalMinutes = this.timelineSelectors.totalMinutes;
  gridOffsetPx = this.timelineSelectors.gridOffsetPx;
  timelineHeight = this.timelineSelectors.timelineHeight;
  blocksByRoom = this.timelineSelectors.blocksByRoom;


  //-------------------- SLOTS ----------------------------------//
  private slotSelectors = inject(SlotSelectorService);

  slots = this.slotSelectors.slots;
  slotsById = this.slotSelectors.slotsById;

  getSlotStartTime(slot: ArtistPerformanceSlot): string {
    return this.slotSelectors.getSlotStartTime(slot);
  };

  getSlotEndTime(slot: ArtistPerformanceSlot): string {
    return this.slotSelectors.getSlotEndTime(slot);
  };


  //-------------------- CUES ----------------------------------//
  private cueSelectors = inject(CueSelectorsService);

  cuesByRoom = this.cueSelectors.cuesByRoom;
  cuesById = this.cueSelectors.cuesById;
}
