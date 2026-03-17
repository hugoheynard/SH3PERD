import { Component, computed, inject, input } from '@angular/core';
import { PlannerResolutionService } from '../services/planner-resolution.service';
import type { ArtistPerformanceSlot } from '../program-types';

@Component({
  selector: 'ui-slot-preview',
  imports: [],
  templateUrl: './slot-preview.component.html',
  styleUrl: './slot-preview.component.scss'
})
export class SlotDragPreviewComponent {

  private res = inject(PlannerResolutionService);

  slot = input.required<ArtistPerformanceSlot>();

  height = computed(() =>
    this.res.minuteToPx(this.slot().duration)
  );

  slotStart() {
    return this.slot().startMinutes;
  }

  slotEnd() {
    return this.slot().startMinutes + this.slot().duration;
  }
}
