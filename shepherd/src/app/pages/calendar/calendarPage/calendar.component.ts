import {Component, OnInit, signal, Signal} from '@angular/core';
import {PlanningGridComponent} from '../planningGrid/planning-grid.component';
import {MatSidenav, MatSidenavContainer} from '@angular/material/sidenav';
import {MatButton} from '@angular/material/button';
import {CalendarHoursGridComponent} from '../backgroundGrid/calendar-hours-grid/calendar-hours-grid.component';
import {CalendarService} from '../../../services/calendar.service';

@Component({
  selector: 'app-calendarPage',
  standalone: true,
  templateUrl: './calendar.component.html',
  styleUrl: './calendar.component.scss',
  imports: [
    PlanningGridComponent,
    CalendarHoursGridComponent,
    MatSidenavContainer, MatSidenav, MatButton
  ]
})
export class CalendarComponent implements OnInit{

  calendarDataSignal: Signal<any> = signal({
    layout: [],
    timestamps: {}
  });

  constructor(private calendarService: CalendarService) {}
  async ngOnInit(): Promise<void> {
    await this.calendarService.getDay('2024-12-19')
    this.calendarDataSignal = this.calendarService.calendarDataSignal;
    console.log(this.calendarDataSignal())
  }

}
