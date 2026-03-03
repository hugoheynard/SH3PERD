import { Component, EventEmitter, Input, Output } from '@angular/core';
import type { PerformanceSlot } from '../program-state.service';
import { PIXELS_PER_MINUTE } from '../utils/PROGRAM_CONSTS';

@Component({
  selector: 'app-performance-slot',
  imports: [],
  templateUrl: './performance-slot.component.html',
  styleUrl: './performance-slot.component.scss',
  host: {
    '[style.top.px]': 'top',
    '[style.height.px]': 'height',
    '[style.background]': "color",
    '(mousedown)': 'onMouseDown($event)'
  }
})
export class PerformanceSlotComponent {
  @Input({ required: true }) slot!: PerformanceSlot;

  @Input() startTime!: string;
  @Input() endTime!: string;


  @Output() slotMouseDown = new EventEmitter<MouseEvent>();

  get top(): number {
    return this.slot.startMinutes * PIXELS_PER_MINUTE;
  }

  get height(): number {
    return this.slot.duration * PIXELS_PER_MINUTE;
  }

  get color(): string {
    return this.slot.color;
  }

  onMouseDown(event: MouseEvent) {
    this.slotMouseDown.emit(event);
  }

  @Output() slotResizeStart = new EventEmitter<MouseEvent>();

  onResizeMouseDown(event: MouseEvent) {
    event.stopPropagation();
    this.slotResizeStart.emit(event);
  }
}
