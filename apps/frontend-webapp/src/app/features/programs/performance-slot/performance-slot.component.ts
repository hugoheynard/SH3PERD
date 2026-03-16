import { Component, computed, inject, input, output} from '@angular/core';
import { ArtistChipComponent } from '../artist-chip/artist-chip.component';
import type { ArtistPerformanceSlot } from '../program-types';
import { PlannerResolutionService } from '../services/planner-resolution.service';
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

    '(pointerdown)': 'onPointerDown($event)',
    '(dblclick)': 'onDoubleClick(this.slot().id)'
  }
})
export class PerformanceSlotComponent {
  private res = inject(PlannerResolutionService);
  private selection = inject(SlotSelectionService);


  /*--------------I/O----------------------------*/

  slot = input.required<ArtistPerformanceSlot>();
  slotStartTime = input<string>();
  slotEndTime = input<string>();
  editSlot = output<string>();
  slotResizeStart = output<PointerEvent>();
  slotPointerDown = output<{ event: PointerEvent, slot: ArtistPerformanceSlot }>();
  removeArtist = output<{ slot_id: string, artist_id: string }>()


  /*-----------------STATE-------------------------*/
  isExpanded = false;

  get isSelected(): boolean {
    return this.selection.isSelected(this.slot().id);
  };

  get isCompact(): boolean {
    return this.slot().duration <= this.res.snapMinutes();
  }

  top = computed(() => this.res.minuteToPx(this.slot().startMinutes));
  height = computed(() => this.res.minuteToPx(this.slot().duration));

  get color(): string {
    return this.slot().color;
  };

  toggleExpanded(event: PointerEvent) {
    event.stopPropagation(); // important pour ne pas déclencher drag
    this.isExpanded = !this.isExpanded;
  };

  onPointerDown(event: PointerEvent) {
    this.slotPointerDown.emit({ event, slot: this.slot() });
  };

  /* ---------------------------------
    * Resize handling
   ---------------------------------*/

  onResizeMouseDown(event: PointerEvent) {
    event.stopPropagation();
    this.slotResizeStart.emit(event);
  };

  onRemoveArtist(artistId: string): void {
    this.removeArtist.emit({ slot_id: this.slot().id, artist_id: artistId });
  };

  onDoubleClick(slot_id: string) {
    this.editSlot.emit(slot_id)
  };
}
