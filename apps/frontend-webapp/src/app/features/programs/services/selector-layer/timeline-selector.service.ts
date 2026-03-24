import { computed, inject, Injectable } from '@angular/core';
import { ProgramStateService } from '../program-state.service';
import type { TimelineBlock } from '../../program-types';
import { PlannerResolutionService } from '../planner-resolution.service';
import { time_functions_utils } from '../../utils/time_functions_utils';


@Injectable({ providedIn: 'root' })
export class TimelineSelectorsService {

  private state = inject(ProgramStateService);
  private res = inject(PlannerResolutionService);

  /* ---------------- TIME ---------------- */

  /**
   * Calculates the total duration of the program in minutes based on the start and end times.
   * It converts the start and end times from "HH:MM" format to total minutes using a utility function.
   * If the end time is earlier than or equal to the start time,
   * it assumes that the program extends past midnight and adds 24 hours (1440 minutes) to the end time before calculating the difference.
   * @returns total duration of the program in minutes
   */
  totalMinutes = computed(() => {
    const start = time_functions_utils(this.state.program().startTime);
    let end = time_functions_utils(this.state.program().endTime);

    if (end <= start) {
      end += 24 * 60;
    }

    return end - start;
  });

  timelineHeight = computed(() =>
    this.res.minuteToPx(this.totalMinutes())
  );

  /**
   * Calculates the grid offset for the view
   */
  gridOffsetPx = computed(() => {
    const startMinutes = time_functions_utils(this.state.program().startTime);
    return (startMinutes % 60) * this.res.pixelsPerMinute();
  });

  /* ---------------- TIMELINE ---------------- */

  /**
   * maps the performance slots and timeline offsets to their respective rooms, creating a structured representation of the program's schedule.
   * It retrieves the current slots and timeline offsets from the program state, then iterates over each slot and buffer to group them by their associated room IDs.
   * The method returns a Map where each key is a room ID and the corresponding value is an array of TimelineBlock objects representing the slots and buffers scheduled for that room, sorted by their start times.
   * This allows for easy access to the schedule of each room in the program, facilitating efficient management and organization of performances and timeline adjustments.
   * @returns a Map of room IDs to arrays of TimelineBlock objects representing the schedule for each room
   */
  blocksByRoom = computed(() => {

    const slots = this.state.program().slots;
    const buffers = this.state.program().timelineOffsets;

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
      const arr = map.get(buffer.room_id) ?? [];
      arr.push({
        type: "buffer",
        id: buffer.id,
        startMinutes: buffer.atMinutes,
        duration: buffer.delta
      });
      map.set(buffer.room_id, arr);
    }

    for (const arr of map.values()) {
      arr.sort((a, b) => a.startMinutes - b.startMinutes);
    }

    return map;
  });


  /**
   * Calculates the adjusted start times for each performance slot in the program, taking into account any timeline offsets that may be applied to the slots.
   * It retrieves the current slots and timeline offsets from the program state, then iterates over each slot to calculate the cumulative time offset (delta) that should be applied to its start time based on the relevant timeline offsets.
   * The method returns a new array of slots with their start times adjusted by the calculated delta, allowing for dynamic scheduling of performances in the program.
   * @returns an array of performance slots with adjusted start times based on timeline offsets
   */
  timelineSlots = computed(() => {

    const slots = this.state.program().slots;
    const offsets = this.state.program().timelineOffsets;

    return slots.map(slot => {

      const delta = offsets
        .filter(o => o.room_id === slot.roomId && o.atMinutes <= slot.startMinutes)
        .reduce((sum, o) => sum + o.delta, 0);

      return {
        ...slot,
        startMinutes: slot.startMinutes + delta
      };
    });
  });
}
