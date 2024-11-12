import {Component, HostBinding, Input, OnInit} from '@angular/core';
import {DatePipe, NgClass, NgIf, NgStyle} from '@angular/common';

type EventType = 'meeting' | 'rehearsal' | 'getIn' | 'off';

export interface EventBlock {
  id: string,
  type: EventType;
  date: Date;
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
  standalone: true,
  templateUrl: './event-block.component.html',
  styleUrl: './event-block.component.scss',
  imports: [
    NgStyle,
    DatePipe,
    NgIf
  ]
})
export class EventBlockComponent implements OnInit{
  @Input() event!: EventBlock;

  @HostBinding('style.gridRowStart') gridRowStart?: number;
  @HostBinding('style.gridRowEnd') gridRowEnd?: number;
  @HostBinding('style.gridColumnStart') gridColumnStart?: number;
  @HostBinding('style.gridColumnEnd') gridColumnEnd?: number;

  ngOnInit() {
    this.gridRowStart = this.event.gridCoordinates.rowStart;
    this.gridRowEnd = this.event.gridCoordinates.rowEnd;
    this.gridColumnStart = this.event.gridCoordinates.colStart;
    this.gridColumnEnd = this.event.gridCoordinates.colEnd;
  }


  onEventClick() {
    console.log(this.event)
  };
}
