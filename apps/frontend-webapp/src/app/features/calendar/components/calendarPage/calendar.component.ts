import {
  Component,
  inject, type OnDestroy,
  type OnInit,
} from '@angular/core';
import {PlanningGridComponent} from '../planningGrid/planning-grid.component';
import {CalendarHoursGridComponent} from '../calendar-hours-grid/calendar-hours-grid.component';

import {LayoutService} from '../../../../core/services/layout.service';
import {AutoScrollToNowDirective} from '../../directives/cal-auto-scroll-to-now.directive';
import type { TEventUnitId } from '@sh3pherd/shared-types';
import { CalendarService } from '../../calendar.service';
import type { TEventUnitDomainModel } from '@sh3pherd/shared-types';

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
export class CalendarComponent implements OnInit, OnDestroy {
  private layoutService = inject(LayoutService);
  private readonly calendarServ = inject(CalendarService);

  readonly calendarData = this.calendarServ.data;

  async ngOnInit(): Promise<void> {
    await this.loadCalendarMenu();

    this.calendarServ.setParams({
      users: ['user_hugo'],
      date: new Date('2025-01-01'),
    });

    this.calendarServ.load();
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


  getPlanningEvents(planning: any): TEventUnitDomainModel[] {
    const data = this.calendarData();

    if (!data || !planning?.calendar_events?.length) {
      console.log('No data or no calendar events found');
      return [];
    }

    return planning.calendar_events
      .map((eventId: TEventUnitId) => data.events[eventId])
      .filter(Boolean);
  }
}
