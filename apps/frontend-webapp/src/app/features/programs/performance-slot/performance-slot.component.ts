import { Component, computed, EventEmitter, inject, input, Output } from '@angular/core';
import { ProgramStateService } from '../services/program-state.service';
import { ArtistChipComponent } from '../artist-chip/artist-chip.component';
import { SlotHoverService } from '../services/slot-hover.service';
import type { PerformanceSlot } from '../program-types';
import { PlannerResolutionService } from '../services/planner-resolution.service';

@Component({
  selector: 'app-performance-slot',
  imports: [
    ArtistChipComponent,
  ],
  templateUrl: './performance-slot.component.html',
  styleUrl: './performance-slot.component.scss',
  host: {
    '[attr.data-slot-id]': "slot().id",
    '[class.hover-artist]':"isHovered",
    '[class.expanded]': 'isExpanded',
    '[style.top.px]': 'top()',
    '[style.height.px]': 'height()',
    '[style.background]': "color",

    '(pointerdown)': 'onPointerDown($event)'
  }
})
export class PerformanceSlotComponent {
  private state = inject(ProgramStateService);
  private hover = inject(SlotHoverService);
  private res = inject(PlannerResolutionService);

  get isHovered(): boolean {
    return this.hover.hovered()?.id === this.slot().id;
  }

  slot = input.required<PerformanceSlot>();
  @Output() slotPointerDown = new EventEmitter<PointerEvent>();

  isExpanded = false;

  get startTime(): string {
    return this.state.getSlotStartTime(this.slot());
  }

  get endTime(): string {
    return this.state.getSlotEndTime(this.slot());
  }

  toggleExpanded(event: PointerEvent) {
    event.stopPropagation(); // important pour ne pas déclencher drag
    this.isExpanded = !this.isExpanded;
  }

  get isCompact(): boolean {
    return this.slot().duration <= this.res.snapMinutes();
  }

  top = computed(() => this.res.minuteToPx(this.slot().startMinutes));
  height = computed(() => this.res.minuteToPx(this.slot().duration));

  get color(): string {
    return this.slot().color;
  }

  onPointerDown(event: PointerEvent) {
    this.slotPointerDown.emit(event);
  }

  /* ---------------------------------
    * Resize handling
   ---------------------------------*/
  @Output() slotResizeStart = new EventEmitter<PointerEvent>();

  onResizeMouseDown(event: PointerEvent) {
    event.stopPropagation();
    this.slotResizeStart.emit(event);
  }

  removeArtist(artistId: string): void {
    this.state.removeArtistFromSlot(this.slot().id, artistId);
  };

  get panelColor(): string {
    return `${this.slot().color}33`;
    // alpha faible (20% approx)
  }

}
