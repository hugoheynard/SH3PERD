import { Component, computed, EventEmitter, inject, input, output, Output } from '@angular/core';
import { ProgramStateService } from '../services/program-state.service';
import { ArtistChipComponent } from '../artist-chip/artist-chip.component';
import type { ArtistPerformanceSlot } from '../program-types';
import { PlannerResolutionService } from '../services/planner-resolution.service';
import { SlotService } from '../services/planner-state-mutations/slot.service';
import { SlotSelectionService } from '../services/slot-selection.service';

@Component({
  selector: 'app-performance-slot',
  imports: [
    ArtistChipComponent,
  ],
  templateUrl: './performance-slot.component.html',
  styleUrl: './performance-slot.component.scss',
  host: {
    '[style.--slot-color]': "color",
    '[attr.data-slot-id]': "slot().id",
    '[class.expanded]': 'isExpanded',
    '[class.selected]': 'isSelected',
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

  private selection = inject(SlotSelectionService);

  get isSelected(): boolean {
    return this.selection.isSelected(this.slot().id);
  }

  private res = inject(PlannerResolutionService);

  editSlot = output<string>()


  slot = input.required<ArtistPerformanceSlot>();
  slotPointerDown = output<PointerEvent>();

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
    const multi = event.shiftKey || event.metaKey || event.ctrlKey;

    this.selection.select(this.slot().id, multi);

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

  onDoubleClick(slot_id: string) {
    this.editSlot.emit(slot_id)
  }


}
