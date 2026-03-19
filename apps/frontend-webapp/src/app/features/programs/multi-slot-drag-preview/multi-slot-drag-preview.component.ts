import { Component, inject, input } from '@angular/core';
import type { ArtistPerformanceSlot } from '../program-types';
import { PlannerResolutionService } from '../services/planner-resolution.service';
import { SlotDragPreviewComponent } from '../slot-preview/slot-preview.component';

export type MultiSlotDragPayload = {
  slots: ArtistPerformanceSlot[];
  offsets: {
    slotId: string;
    offsetMinutes: number;
  }[];
};

@Component({
  selector: 'ui-multi-slot-drag-preview',
  imports: [
    SlotDragPreviewComponent,
  ],
  templateUrl: './multi-slot-drag-preview.component.html',
  styleUrl: './multi-slot-drag-preview.component.scss'
})
export class MultiSlotDragPreviewComponent {
  slots = input.required<ArtistPerformanceSlot[]>();
  offsets = input.required<{ slotId: string; offsetMinutes: number }[]>();

  private res = inject(PlannerResolutionService);

  computeTransform(slot: ArtistPerformanceSlot) {
    const offset = this.offsets().find(o => o.slotId === slot.id);

    const y = this.res.minuteToPx(offset?.offsetMinutes ?? 0);

    return `translateY(${y}px)`;
  }
}
