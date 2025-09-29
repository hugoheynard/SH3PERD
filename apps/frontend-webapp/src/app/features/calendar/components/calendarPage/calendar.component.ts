import {
  Component,
  inject, type OnDestroy,
  type OnInit,
} from '@angular/core';
import {PlanningGridComponent} from '../planningGrid/planning-grid.component';
import {CalendarHoursGridComponent} from '../calendar-hours-grid/calendar-hours-grid.component';

import {LayoutService} from '../../../../core/services/layout.service';
import {AutoScrollToNowDirective} from '../../directives/cal-auto-scroll-to-now.directive';
import { CalendarStore } from '../../calendar-store';
import type { TEventUnitId } from '@sh3pherd/shared-types';

@Component({
  selector: 'app-calendarPage',
  templateUrl: './calendar.component.html',
  styleUrl: './calendar.component.scss',
  standalone: true,
  imports: [
    PlanningGridComponent,
    CalendarHoursGridComponent,
    AutoScrollToNowDirective
]
})
export class CalendarComponent implements OnInit, OnDestroy{
  private layoutService: LayoutService = inject(LayoutService);
  private readonly calendarStore = inject(CalendarStore);

  readonly calendarData = this.calendarStore.data;

  async ngOnInit(): Promise<void> {
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
    return planning.calendar_events.map((event: TEventUnitId) => this.calendarData().events[event])
  };
}
