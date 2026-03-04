import { Component, EventEmitter, Input, Output } from '@angular/core';
import type { PerformanceSlot } from '../program-state.service';
import { PIXELS_PER_MINUTE } from '../utils/PROGRAM_CONSTS';
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
    '[style.top.px]': 'top',
    '[style.height.px]': 'height',
    '[style.background]': "color",

    '(pointerdown)': 'onPointerDown($event)'
  }
})
export class PerformanceSlotComponent {
  @Input({ required: true }) slot!: PerformanceSlot;

  @Input() startTime!: string;
  @Input() endTime!: string;

  @Input() hoverArtist = false;

  @Output() slotPointerDown = new EventEmitter<PointerEvent>();

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


}
