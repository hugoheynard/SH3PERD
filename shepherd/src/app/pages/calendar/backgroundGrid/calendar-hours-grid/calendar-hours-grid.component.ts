import {Component, Input} from '@angular/core';
import {DatePipe, DecimalPipe, NgForOf} from '@angular/common';
import {LinesGridComponent} from '../lines-grid/lines-grid.component';
import {TexthoursGridComponent} from '../texthours-grid/texthours-grid.component';

@Component({
  selector: 'app-calendar-hours-grid',
  standalone: true,
  imports: [
    NgForOf,
    DecimalPipe,
    LinesGridComponent,
    TexthoursGridComponent,
    DatePipe
  ],
  templateUrl: './calendar-hours-grid.component.html',
  styleUrl: './calendar-hours-grid.component.scss'
})
export class CalendarHoursGridComponent {

  @Input() gridOffset: number = 0;
  @Input() gridRowsNumber: number = 0;
  @Input() hoursList: { timestamp: Date, rowStart: number }[] = [{timestamp: new Date(), rowStart: 0}];

}
