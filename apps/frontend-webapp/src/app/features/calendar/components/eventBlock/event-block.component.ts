import {Component, HostBinding, Input} from '@angular/core';
import { DatePipe } from '@angular/common';

type EventType = 'meeting' | 'rehearsal' | 'getIn' | 'off';

export interface EventBlock {
  id: string,
  type: EventType;
  date: Date;
  startDate: Date;
  endDate: Date;
  duration: number;
  gridCoordinates: {
    rowStart: number;
    rowEnd: number;
    colStart: number;
    colEnd: number;
  }
}

@Component({
  selector: 'app-eventBlock',
  templateUrl: './event-block.component.html',
  styleUrl: './event-block.component.scss',
  standalone: true,
  imports: [
    DatePipe
]
})
export class EventBlockComponent {
  @Input() event!: EventBlock;

  @HostBinding('style.gridRowStart') gridRowStart?: number;
  @HostBinding('style.gridRowEnd') gridRowEnd?: number;
  @HostBinding('style.gridColumnStart') gridColumnStart?: number;
  @HostBinding('style.gridColumnEnd') gridColumnEnd?: number;


  onEventClick() {
    console.log(this.event)
  };
}
