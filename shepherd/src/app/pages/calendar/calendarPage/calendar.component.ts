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

  @ViewChild('calendarContainer') calendarContainer!: ElementRef;

  currentHour: number = new Date().getHours();
  currentMinute: number = new Date().getMinutes();

  async ngOnInit(): Promise<void> {

    await this.calendarService.getCalendarData({
      users: ['66e6e31d450539b53874aee5'],
      date: ['2024-12-19'],
      calendarOptions: this.calendarOptions
    });

    this.calendarDataSignal = this.calendarService.calendarDataSignal;
    console.log(this.calendarDataSignal());
  };

  getPlanningEvents(planning: any) {
    return planning.calendar_events.map((event: string) => this.calendarDataSignal().calendarData.events[event])
  };

  scrollToCurrentTime() {
    // Calculer l'index de la ligne pour l'heure actuelle
    const totalMinutes = this.currentHour * 60 + this.currentMinute;
    const rowIndex = Math.floor(totalMinutes / 5); // 1 ligne = 5 minutes
    const scrollPosition = rowIndex * 15; // Chaque ligne = 10px

    // Effectuer le défilement
    this.calendarContainer.nativeElement.scrollTo({
      top: scrollPosition,
      behavior: 'smooth',
    });
  }

  ngAfterViewInit(): void {
    //console.log(this.calendarContainer.nativeElement);
    //this.scrollToCurrentTime();
  };



}
