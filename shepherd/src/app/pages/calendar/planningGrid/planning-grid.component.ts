import {Component, Input, OnInit} from '@angular/core';
import {CalendarService} from '../../../services/calendar.service';
import {EventBlockComponent} from '../eventBlock/event-block.component';
import {NgClass, NgForOf, NgIf, NgStyle} from '@angular/common';


@Component({
  selector: 'app-planningGrid',
  standalone: true,
  imports: [
    EventBlockComponent,
    NgStyle,
    NgForOf,
    NgIf,
    NgClass
  ],
  templateUrl: './planning-grid.component.html',
  styleUrl: './planning-grid.component.scss'
})
export class PlanningGridComponent{
  planningData: any; // Define the structure according to your data model
  @Input() calendarData: any
  @Input() layout!: { gridTotalColNumber: number; gridRowsNumber: number };
  constructor(private calendarService: CalendarService) {}

  get gridSpecs() {
    if (!this.layout) {
      return {};
    }

    const { gridTotalColNumber , gridRowsNumber} = this.layout;

    return {
      'grid-template-columns': `repeat(${gridTotalColNumber}, 1fr)`,
      'grid-template-rows': `repeat(${gridRowsNumber}, 18px)`
    }
  };
}
