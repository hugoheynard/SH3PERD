import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { type PerformanceSlot, ProgramStateService } from '../program-state.service';
import { PIXELS_PER_MINUTE, SNAP_MINUTES } from '../utils/PROGRAM_CONSTS';
import { ArtistChipComponent } from '../artist-chip/artist-chip.component';

@Component({
  selector: 'app-performance-slot',
  imports: [
    ArtistChipComponent,
  ],
  templateUrl: './performance-slot.component.html',
  styleUrl: './performance-slot.component.scss',
  host: {
    '[attr.data-slot-id]': "slot.id",
    '[class.hover-artist]':"hoverArtist",
    '[class.expanded]': 'isExpanded',
    '[style.top.px]': 'top',
    '[style.height.px]': 'height',
    '[style.background]': "color",

    '(pointerdown)': 'onPointerDown($event)'
  }
})
export class PerformanceSlotComponent {
  private state = inject(ProgramStateService);

  @Input({ required: true }) slot!: PerformanceSlot;
  @Input() hoverArtist = false;
  @Output() slotPointerDown = new EventEmitter<PointerEvent>();

  isExpanded = false;

  get startTime(): string {
    return this.state.getSlotStartTime(this.slot);
  }

  get endTime(): string {
    return this.state.getSlotEndTime(this.slot);
  }

  toggleExpanded(event: PointerEvent) {
    event.stopPropagation(); // important pour ne pas déclencher drag
    this.isExpanded = !this.isExpanded;
  }

  get isCompact(): boolean {
    return this.slot.duration <= SNAP_MINUTES;
  }

  get top(): number {
    return this.slot.startMinutes * PIXELS_PER_MINUTE;
  }

  get height(): number {
    return this.slot.duration * PIXELS_PER_MINUTE;
  }

  get color(): string {
    return this.slot.color;
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

  @Output() removeArtistFromSlot =
    new EventEmitter<{ slotId: string; artistId: string }>();

  removeArtist(artistId: string) {
    this.removeArtistFromSlot.emit({
      slotId: this.slot.id,
      artistId
    });
  }

  get panelColor(): string {
    return `${this.slot.color}33`;
    // alpha faible (20% approx)
  }

}
