import {
  type AfterViewInit,
  Component,
  inject, type OnDestroy,
  type OnInit,
  signal,
  type Signal,
} from '@angular/core';
import {PlanningGridComponent} from '../planningGrid/planning-grid.component';
import {CalendarHoursGridComponent} from '../calendar-hours-grid/calendar-hours-grid.component';
import {CalendarService} from '../../api/calendar.service';
import {NgForOf} from '@angular/common';
import {LayoutService} from '../../../../../core/services/layout.service';
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
  //private injector: Injector = inject(Injector);
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
