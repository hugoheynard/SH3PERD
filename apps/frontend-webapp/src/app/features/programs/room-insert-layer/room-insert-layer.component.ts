import { InsertLineComponent } from '../insert-interaction-system/insert-line/insert-line.component';
import { Component, computed, inject, input } from '@angular/core';
import { TimelineCueComponent } from '../timeline-cue/timeline-cue.component';
import { SlotPlannerComponent } from '../slot-planner/slot-planner.component';
import { InsertLineService } from '../insert-interaction-system/state-services/insert-line.service';
import { PlannerResolutionService } from '../services/planner-resolution.service';
import { SlotService } from '../services/mutations-layer/slot.service';
import { CueService } from '../services/mutations-layer/cue.service';
import type { ArtistPerformanceSlot, Room } from '../program-types';



@Component({
  selector: 'ui-room-insert-layer',
  standalone: true,
  imports: [
    InsertLineComponent,
    TimelineCueComponent,
    SlotPlannerComponent,
  ],
  templateUrl: './room-insert-layer.component.html',
  styleUrl: './room-insert-layer.component.scss'
})
export class RoomInsertLayerComponent {

  private insert = inject(InsertLineService);
  private res = inject(PlannerResolutionService);
  private slotServ = inject(SlotService);
  private cueServ = inject(CueService);

  room = input.required<Room>();

  /* ---------------- INSERT ---------------- */

  indicator = computed(() => {
    const indicator = this.insert.indicator();

    if (!indicator) return null;

    if (!indicator.multiRoom && indicator.roomId !== this.room().id) {
      return null;
    }

    return indicator;
  });

  insertTopPx = computed(() => {
    const minutes = this.insert.minutes();
    return minutes === null
      ? null
      : this.res.minuteToPx(minutes);
  });

  isAltMode = this.insert.altMode;

  /* ---------------- GHOST SLOT ---------------- */

  ghostSlot = computed<ArtistPerformanceSlot | null>(() => {

    const indicator = this.insert.indicator();
    const type = this.insert.previewType();

    if (!indicator || type !== 'slot') return null;
    if (indicator.roomId !== this.room().id) return null;

    return this.slotServ.createDefault({
      startMinutes: indicator.minutes,
      roomId: indicator.roomId,
      id: 'ghost'
    });
  });

  /* ---------------- GHOST CUE ---------------- */

  ghostCue = computed(() => {

    const indicator = this.insert.indicator();
    const type = this.insert.previewType();

    if (!indicator || type !== 'cue') return null;
    if (indicator.roomId !== this.room().id) return null;

    return this.cueServ.createDefault({
      id: 'ghost',
      minutes: indicator.minutes,
      roomId: indicator.roomId
    });
  });

  getGhostTop(min: number) {
    return this.res.minuteToPx(min)
  }
}
