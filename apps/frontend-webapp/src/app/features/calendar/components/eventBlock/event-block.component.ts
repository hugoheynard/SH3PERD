import { Component,  input } from '@angular/core';
import { DatePipe } from '@angular/common';
import type { TEventUnitDomainModel } from '@sh3pherd/shared-types';


@Component({
  selector: 'eventBlock',
  templateUrl: './event-block.component.html',
  styleUrl: './event-block.component.scss',
  standalone: true,
  imports: [
    DatePipe
]
})
export class EventBlockComponent {
  public readonly event = input.required<TEventUnitDomainModel>();


  onEventClick() {
    console.log(this.event)
  };
}
