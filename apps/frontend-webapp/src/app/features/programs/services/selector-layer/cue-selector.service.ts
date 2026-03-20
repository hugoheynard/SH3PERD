import { computed, inject, Injectable } from '@angular/core';
import { ProgramStateService } from '../program-state.service';
import type { TimelineCue } from '../../program-types';

/**
 * Provides all cue-related selectors for the planner.
 *
 * ---------------------------------------------------------------------------
 * 🧠 ROLE IN ARCHITECTURE
 * ---------------------------------------------------------------------------
 *
 * Part of the **Selector Layer**.
 *
 * This service isolates all logic related to cues:
 * - grouping
 * - lookup
 * - derived data
 *
 * It is consumed by PlannerSelectorService (facade).
 *
 */
@Injectable({ providedIn: 'root' })
export class CueSelectorsService {

  private state = inject(ProgramStateService);

  /**
   * Returns a Map<roomId, TimelineCue[]>
   */
  cuesByRoom = computed(() => {

    const map = new Map<string, TimelineCue[]>();

    for (const cue of this.state.program().cues) {

      const arr = map.get(cue.roomId) ?? [];

      arr.push(cue);

      map.set(cue.roomId, arr);
    }

    return map;
  });

  /**
   * Returns a Map<cueId, TimelineCue>
   */
  cuesById = computed(() => {

    const map = new Map<string, TimelineCue>();

    for (const cue of this.state.program().cues) {
      map.set(cue.id, cue);
    }

    return map;
  });

  selectedCues = computed(() => {

  })


}
