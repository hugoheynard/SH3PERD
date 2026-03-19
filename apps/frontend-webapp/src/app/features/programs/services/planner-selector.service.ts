import { computed, inject, Injectable } from '@angular/core';
import { ProgramStateService } from './program-state.service';
import { minutesToTime, time_functions_utils } from '../utils/time_functions_utils';
import type { ArtistPerformanceSlot, TimelineBlock, TimelineCue } from '../program-types';
import { PlannerResolutionService } from './planner-resolution.service';
import { TimelineInteractionStore } from './timeline-interactions/timeline-interaction.store';


/**
 * The PlannerSelectorService is an Angular service that provides computed properties for accessing various aspects of a program's state, such as its name, start and end times, staff, rooms, and slots.
 * It uses the ProgramStateService to retrieve the current program's data and calculates the total duration of the program in minutes based on the start and end times.
 * The service is designed to be injected into other components or services that require access to the program's state information.
 */
@Injectable({ providedIn: 'root' })
export class PlannerSelectorService {

  private state = inject(ProgramStateService);
  private res = inject(PlannerResolutionService);
  private interactionStore = inject(TimelineInteractionStore);

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
  timelineOffsets = computed(() => this.state.program().timelineOffsets);

  timelineHeight = computed(() => this.res.minuteToPx(this.totalMinutes()));

  /**
   * Calculates the grid offset for the view
   */
  gridOffsetPx = computed(() => {
    const startMinutes = time_functions_utils(this.startTime());
    return (startMinutes % 60) * this.res.pixelsPerMinute();
  });


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

  /**
   * Calculates the adjusted start times for each performance slot in the program, taking into account any timeline offsets that may be applied to the slots.
   * It retrieves the current slots and timeline offsets from the program state, then iterates over each slot to calculate the cumulative time offset (delta) that should be applied to its start time based on the relevant timeline offsets.
   * The method returns a new array of slots with their start times adjusted by the calculated delta, allowing for dynamic scheduling of performances in the program.
   * @returns an array of performance slots with adjusted start times based on timeline offsets
   */
  timelineSlots = computed(() => {

    const slots = this.slots();
    const offsets = this.timelineOffsets();

    return slots.map(slot => {

      const delta = offsets
        .filter(o => o.roomId === slot.roomId && o.atMinutes <= slot.startMinutes)
        .reduce((sum, o) => sum + o.delta, 0);

      return {
        ...slot,
        startMinutes: slot.startMinutes + delta
      };
    });
  });

  /**
   * maps the performance slots and timeline offsets to their respective rooms, creating a structured representation of the program's schedule.
   * It retrieves the current slots and timeline offsets from the program state, then iterates over each slot and buffer to group them by their associated room IDs.
   * The method returns a Map where each key is a room ID and the corresponding value is an array of TimelineBlock objects representing the slots and buffers scheduled for that room, sorted by their start times.
   * This allows for easy access to the schedule of each room in the program, facilitating efficient management and organization of performances and timeline adjustments.
   * @returns a Map of room IDs to arrays of TimelineBlock objects representing the schedule for each room
   */
  blocksByRoom = computed(() => {

    const slots = this.slots();
    const buffers = this.timelineOffsets();

    const map = new Map<string, TimelineBlock[]>();

    for (const slot of slots) {
      const arr = map.get(slot.roomId) ?? [];
      arr.push({
        type: "slot",
        id: slot.id,
        startMinutes: slot.startMinutes,
        duration: slot.duration,
        slot
      });
      map.set(slot.roomId, arr);
    }

    for (const buffer of buffers) {
      const arr = map.get(buffer.roomId) ?? [];
      arr.push({
        type: "buffer",
        id: buffer.id,
        startMinutes: buffer.atMinutes,
        duration: buffer.delta
      });
      map.set(buffer.roomId, arr);
    }

    for (const arr of map.values()) {
      arr.sort((a, b) => a.startMinutes - b.startMinutes);
    }

    return map;
  });

  /**
   * The method iterates through the slots to provide a Map <slot_id, slot>
   * @returns a Map where each key is a slot ID and the corresponding value is the ArtistPerformanceSlot object associated with that ID, allowing for efficient retrieval of performance slot information based on their unique identifiers.
   */
  slotsById = computed(() => {
    const map = new Map<string, ArtistPerformanceSlot>();

    for (const slot of this.slots()) {
      map.set(slot.id, slot);
    }

    return map;
  });

  slotsByRoom = computed(() => {

    const map = new Map<string, ArtistPerformanceSlot[]>();

    for (const slot of this.slots()) {

      const arr = map.get(slot.roomId) ?? [];

      arr.push(slot);

      map.set(slot.roomId, arr);
    }

    return map;
  });


  getSlotStartTime(slot: ArtistPerformanceSlot): string {
    const programStartMinutes = time_functions_utils(this.startTime());
    const absolute = programStartMinutes + slot.startMinutes;
    return minutesToTime(absolute);
  };


  getSlotEndTime(slot: ArtistPerformanceSlot): string {
    const programStartMinutes = time_functions_utils(this.startTime());
    const absolute =
      programStartMinutes + slot.startMinutes + slot.duration;
    return minutesToTime(absolute);
  };

  /**
   * Used to display the dragging slots
   */
  displaySlots = computed(() => {

    const baseSlots = this.slots();
    const dragging = this.interactionStore.draggingSlots();

    if (!dragging) return baseSlots;

    const previewMap = new Map(
      dragging.map(s => [s.slotId, s])
    );

    return baseSlots.map(slot => {

      const preview = previewMap.get(slot.id);

      if (!preview) return slot;

      return {
        ...slot,
        startMinutes: preview.previewStart,
        roomId: preview.previewRoomId ?? slot.roomId,
        isPreview: true
      };
    });
  });

  //CUES

  cuesByRoom = computed(() => {

    const map = new Map<string, TimelineCue[]>();

    for (const cue of this.state.program().cues) {
      const arr = map.get(cue.roomId) ?? [];
      arr.push(cue);
      map.set(cue.roomId, arr);
    }

    return map;
  });
}
