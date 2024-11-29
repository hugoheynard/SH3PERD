import {AfterViewInit, Component, ElementRef, inject, OnInit, signal, Signal, ViewChild} from '@angular/core';
import {PlanningGridComponent} from '../planningGrid/planning-grid.component';
import {MatSidenav, MatSidenavContainer} from '@angular/material/sidenav';
import {MatButton} from '@angular/material/button';
import {CalendarHoursGridComponent} from '../backgroundGrid/calendar-hours-grid/calendar-hours-grid.component';
import {CalendarService} from '../../../services/calendar.service';
import {AppMenuComponent} from '../../../components/menus/appMenu/app-menu.component';
import {MatCalendar} from '@angular/material/datepicker';
import {DatePickerCalendarComponent} from '../date-picker-calendar/date-picker-calendar.component';
import {EventReactformComponent} from '../../../forms/event-reactform/event-reactform.component';
import {NgForOf} from '@angular/common';

@Component({
  selector: 'app-calendarPage',
  standalone: true,
  templateUrl: './calendar.component.html',
  styleUrl: './calendar.component.scss',
  imports: [
    PlanningGridComponent,
    CalendarHoursGridComponent,
    MatSidenavContainer, MatSidenav, MatButton, AppMenuComponent, MatCalendar, DatePickerCalendarComponent, EventReactformComponent, NgForOf
  ]
})
export class CalendarComponent implements OnInit, AfterViewInit{
  public calendarService = inject(CalendarService);
  constructor(private el: ElementRef) {}
  @ViewChild('calendarContainer') calendarContainer!: ElementRef;

  public calendarOptions: any  = {
    viewMode: 'singlePersonDay',
    crossPath: false //crossPath: persons who work when and where I work
  }

  //singlePersonWeek

  calendarDataSignal: Signal<any> = signal({
    calendarData: {
      events: [],
      plannings: []
    }
  });



  currentHour: number = new Date().getHours();
  currentMinute: number = new Date().getMinutes();

  async ngOnInit(): Promise<void> {

    await this.calendarService.getCalendarData({
      users: ['66e6e31d450539b53874aee5', '66df0404c4d622c017701e3d'],
      date: ['2024-12-19'],
      calendarOptions: this.calendarOptions
    });

    this.calendarDataSignal = this.calendarService.calendarDataSignal;
    console.log(this.calendarDataSignal());
  };

  ngAfterViewInit(): void {
    this.scrollToCurrentTime();
  };

  getPlanningEvents(planning: any) {
    return planning.calendar_events.map((event: string) => this.calendarDataSignal().calendarData.events[event])
  };

  scrollToCurrentTime() {
    const totalMinutes = this.currentHour * 60 + this.currentMinute;
    const rowIndex = Math.floor(totalMinutes / 5);
    const scrollPosition = rowIndex * 15;

    console.log(this.el)

    this.calendarContainer.nativeElement.scrollTo({
      top: scrollPosition,
      behavior: 'smooth',
    });

    // Effectuer le défilement
    this.el.nativeElement.scrollTo({
      top: scrollPosition,
      behavior: 'smooth',
    });
  }
}
