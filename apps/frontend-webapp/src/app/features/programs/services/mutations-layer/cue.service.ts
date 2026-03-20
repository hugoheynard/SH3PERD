import { Injectable } from '@angular/core';
import type { TimelineCue } from '../../program-types';
import { BaseTimelineItemCRUD } from './BaseTimelineItemCRUD';


/**
 * Service responsible for managing timeline cues.
 *
 * This service handles all mutations related to cues in the planner state.
 * It extends {@link BaseTimelineItemCRUD} to inherit generic CRUD operations
 * (add, remove, patch, update), while keeping cue-specific logic isolated.
 *
 * ---------------------------------------------------------------------------
 * 🧠 RESPONSIBILITIES
 * ---------------------------------------------------------------------------
 *
 * - Manage cue lifecycle (create, delete, update)
 * - Provide helper methods for cue-specific mutations
 * - Expose factory methods for creating default cues (used by insert system / ghost preview)
 *
 * ---------------------------------------------------------------------------
 * ⚠️ DESIGN NOTES
 * ---------------------------------------------------------------------------
 *
 * - All state mutations go through ProgramHistoryService (via BaseItemManager)
 * - This service contains ONLY cue-related logic (no UI concerns)
 * - Complex interactions (drag, insert, keyboard) are handled elsewhere
 *
 * ---------------------------------------------------------------------------
 * 🚀 USAGE
 * ---------------------------------------------------------------------------
 *
 * cueService.add(...)
 * cueService.remove(...)
 * cueService.updateCuePosition(...)
 * cueService.createDefaultCue(...)
 */
@Injectable({
  providedIn: 'root'
})
export class CueService
  extends BaseTimelineItemCRUD<'cues'>
{

  constructor() {
    super('cues');
  }
  /* ---------------------------------
    POSITION / TIMING
  ---------------------------------- */

  /**
   * Updates the timeline position of a cue.
   *
   * @param cueId - ID of the cue
   * @param minutes - New time position (in minutes)
   */
  updateCueTime(cueId: string, minutes: number) {
    this.patch(cueId, cue => ({
      ...cue,
      atMinutes: minutes
    }));
  }

  /**
   * Updates the room of a cue.
   *
   * @param cueId
   * @param roomId
   */
  updateCueRoom(cueId: string, roomId: string) {
    this.patch(cueId, cue => ({
      ...cue,
      roomId
    }));
  }

  /**
   * Updates the label of a cue.
   *
   * @param cueId
   * @param label
   */
  updateCueLabel(cueId: string, label: string) {
    this.patch(cueId, cue => ({
      ...cue,
      label
    }));
  }

  /* ---------------------------------
    FACTORY
  ---------------------------------- */

  /**
   * Creates a default cue.
   *
   * Used by:
   * - Insert system
   * - Ghost preview
   *
   * @param p - Initial cue parameters
   */
  createDefault(p: {
    id: string;
    minutes: number;
    roomId: string;
    overrides?: Partial<TimelineCue>;
  }): TimelineCue {
    return {
      id: p.id,
      atMinutes: p.minutes,
      roomId: p.roomId,
      label: 'New cue',
      type: 'default',
      ...p.overrides
    };
  }
}
