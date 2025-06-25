import {
  AfterViewInit,
  Component,
  inject, Injector, OnDestroy,
  OnInit,
  signal,
  Signal,
} from '@angular/core';
import {PlanningGridComponent} from '../planningGrid/planning-grid.component';
import {MatSidenav, MatSidenavContainer} from '@angular/material/sidenav';
import {MatButton} from '@angular/material/button';
import {CalendarHoursGridComponent} from '../backgroundGrid/calendar-hours-grid/calendar-hours-grid.component';
import {CalendarService} from '../../api/calendar.service';
import {AppMenuComponent} from '../../../../components/menus/appMenu/app-menu.component';
import {MatCalendar} from '@angular/material/datepicker';
import {DatePickerCalendarComponent} from '../date-picker-calendar/date-picker-calendar.component';
import {EventReactformComponent} from '../../../../forms/event-reactform/event-reactform.component';
import {NgForOf} from '@angular/common';
import {LayoutService} from '../../../../../core/services/layout.service';
import {CalendarMenuComponent} from '../calendar-menu/calendar-menu.component';
import {AutoScrollToNowDirective} from '../../core/directives/cal-auto-scroll-to-now.directive';

@Component({
  selector: 'app-calendarPage',
  templateUrl: './calendar.component.html',
  styleUrl: './calendar.component.scss',
  standalone: true,
  imports: [
    PlanningGridComponent,
    CalendarHoursGridComponent,
    NgForOf,
    AutoScrollToNowDirective
  ]
})
export class CalendarComponent implements OnInit, AfterViewInit, OnDestroy{
  private injector: Injector = inject(Injector);
  private layoutService: LayoutService = inject(LayoutService);
  public calendarService: CalendarService = inject(CalendarService)

  public calendarOptions: any  = {
    viewMode: 'singlePersonDay',
    crossPath: false //crossPath: persons who work when and where I work
  };

  //singlePersonWeek
  calendarDataSignal: Signal<any> = signal({
    calendarData: {
      events: [],
      plannings: []
    }
  });

  async ngOnInit(): Promise<void> {};

  async ngAfterViewInit(): Promise<void> {
    await this.loadCalendarMenu();
  };

  ngOnDestroy(): void {
    this.layoutService.clearAll();
  };

  //COMPONENTS LAZY LOADINGS
  /**Lazy loads the calendar menu component*/
  async loadCalendarMenu(): Promise<void> {
    const { CalendarMenuComponent } = await import('../calendar-menu/calendar-menu.component');
    this.layoutService.setContextMenu(CalendarMenuComponent);
  };



  getPlanningEvents(planning: any) {
    return planning.calendar_events.map((event: string) => this.calendarDataSignal().calendarData.events[event])
  };
}
