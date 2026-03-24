import { inject, Injectable } from '@angular/core';
import { SlotSelectionService } from './timeline-interactions-engine/element-selection/slot-selection.service';
import { CueSelectionService } from './timeline-interactions-engine/element-selection/cue-selection.service';
import { SlotService } from './mutations-layer/slot.service';
import { PlannerSelectorService } from './selector-layer/planner-selector.service';
import { InsertLineService } from '../timeline/insert-interaction-system/state-services/insert-line.service';
import { CueService } from './mutations-layer/cue.service';


@Injectable({ providedIn: 'root' })
export class TimelineKeyboardController {

  private slotSelection = inject(SlotSelectionService);
  private cueSelection = inject(CueSelectionService);
  private cueService = inject(CueService);
  private slotServ = inject(SlotService);
  private selector = inject(PlannerSelectorService);
  private insert = inject(InsertLineService);

  /* ---------------- KEY DOWN ---------------- */

  handleKeyDown(event: KeyboardEvent) {

    const target = event.target as HTMLElement;

    // ignore inputs
    if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
      return;
    }

    /* DUPLICATE */

    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'd') {

      event.preventDefault();

      const ids = this.slotSelection.getSelectedIds();

      ids.forEach(id => {

        const slot = this.selector.slotsById().get(id);
        if (!slot) {
          return;
        }

        this.slotServ.add({
          ...slot,
          id: crypto.randomUUID(),
          startMinutes: slot.startMinutes + slot.duration,
        });
      });

      return;
    }

    /* DELETE */

    if (event.key === 'Delete' || event.key === 'Backspace') {

      event.preventDefault();

      const slotIds = this.slotSelection.getSelectedIds();
      const cueIds = this.cueSelection.getSelectedIds();

      slotIds.forEach(id => this.slotServ.remove(id));
      cueIds.forEach(id => this.cueService.remove(id));

      this.slotSelection.clear();
      this.cueSelection.clear();
    }

    /* ALT MODE */

    if (event.altKey) {
      this.insert.enableAltMode();
    }
  }

  /* ---------------- KEY UP ---------------- */

  handleKeyUp(event: KeyboardEvent) {
    if (event.key === 'Alt') {
      this.insert.disableAltMode();
      this.insert.clear();
    }
  }

  /* ---------------- BLUR ---------------- */

  handleBlur() {
    this.insert.disableAltMode();
    this.insert.clear();
  }
}
