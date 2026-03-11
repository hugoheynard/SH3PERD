import { Component, computed, EventEmitter, inject, input, output, Output } from '@angular/core';
import { ProgramStateService } from '../services/program-state.service';
import { ArtistChipComponent } from '../artist-chip/artist-chip.component';
import { SlotHoverService } from '../services/drag-interactions/slot-hover.service';
import type { ArtistPerformanceSlot } from '../program-types';
import { PlannerResolutionService } from '../services/planner-resolution.service';
import { SlotService } from '../services/planner-state-mutations/slot.service';

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

    '(pointerdown)': 'onPointerDown($event)',
    '(dblclick)': 'onDoubleClick(this.slot().id)'
  }
})
export class PerformanceSlotComponent {
  private state = inject(ProgramStateService);
  private slotServ = inject(SlotService);

  private hover = inject(SlotHoverService);
  private res = inject(PlannerResolutionService);

  editSlot = output<string>()

  get isHovered(): boolean {
    return this.hover.hovered()?.id === this.slot().id;
  }

  slot = input.required<ArtistPerformanceSlot>();
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

    this.slotServ.removeArtistFromSlot(this.slot().id, artistId);
  };

  get panelColor(): string {
    return `${this.slot().color}33`;
    // alpha faible (20% approx)
  }

  onDoubleClick(slot_id: string) {
    this.editSlot.emit(slot_id)
  }


}
