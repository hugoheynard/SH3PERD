import { inject, Injectable } from '@angular/core';
import { SlotSelectionService } from './slot-selection.service';
import { CueSelectionService } from './cue-selection.service';


/**
 * Façade for element selection
 * //TODO : use or not?
 */
@Injectable({
  providedIn: 'root'
})
export class TimelineElementSelectionService {
  private slotSelection = inject(SlotSelectionService);
  private cueSelection = inject(CueSelectionService);

  /* ---------------- STATE ---------------- */

  selectedSlots = this.slotSelection.selected;
  selectedCues = this.cueSelection.selected;

  /* ---------------- API ---------------- */

  clearAll() {
    this.slotSelection.clear();
    this.cueSelection.clear();
  }

  selectSlot(id: string, ordered: string[], event: PointerEvent) {
    this.cueSelection.clear(); // 🔥 important
    this.slotSelection.select(id, ordered, event);
  }

  selectCue(id: string, ordered: string[], event: PointerEvent) {
    this.slotSelection.clear(); // 🔥 important
    this.cueSelection.select(id, ordered, event);
  }
}
