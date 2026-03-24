import { inject, Injectable } from '@angular/core';
import { BaseSelectionService } from './BaseSelectionService';
import { PlannerSelectorService } from '../../selector-layer/planner-selector.service';


/**
 * Manages selection state for timeline cues.
 *
 * ---------------------------------------------------------------------------
 * 🧠 ROLE
 * ---------------------------------------------------------------------------
 *
 * Stores ONLY cue IDs (source of truth).
 *
 * Objects are derived via selectors (CueSelectorsService).
 *
 * ---------------------------------------------------------------------------
 * ⚠️ IMPORTANT
 * ---------------------------------------------------------------------------
 *
 * - Never store full cue objects (avoid stale references)
 * - Always store IDs
 *
 */
@Injectable({ providedIn: 'root' })
export class CueSelectionService
  extends BaseSelectionService<string> {

  private selector = inject(PlannerSelectorService);

  handleSlotPointerDown(
    slot_id: string,
    room_id: string,
    event: PointerEvent
  ) {
    const ordered = this.selector.getOrderedCueIdsByRoom(room_id);

    super.handlePointerDown(slot_id, ordered, event);
  }
}
