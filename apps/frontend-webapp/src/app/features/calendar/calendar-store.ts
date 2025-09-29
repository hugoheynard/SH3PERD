import { effect, inject, Injectable, signal } from '@angular/core';
import { CalendarService } from './calendar.service';
import type { TUserId, TUserGroupId, TContractId } from '@sh3pherd/shared-types';
//import { UserContextService } from '../../core/services/user-context.service';
import { WorkspaceContextService } from '../../core/services/workspace-context.service';

export interface CalendarDataRequest {
  users: TUserId[],
  scope:
    | { type: 'me'; contract_id: TContractId }
    | { type: 'user'; contract_id: TContractId }
    | { type: 'group'; contract_id: TUserGroupId };

  granularity: 'day' | 'week' | 'month',
  date: Date,
  crossPath: boolean
}

export type CalendarDataResponse = any;

@Injectable({
  providedIn: 'root'
})
export class CalendarStore {
  private readonly calendarService = inject(CalendarService);
  //private readonly userCtx = inject(UserContextService);
  private readonly workspaceCtx = inject(WorkspaceContextService);

  /**
   * Parameters for loading calendar data
   * @private
   */
  private params = signal<CalendarDataRequest>({
    users: [],
    scope: {
      type: 'me',
      contract_id: this.workspaceCtx.currentContractIdStrict()
    },
    granularity: 'day',
    date: new Date(Date.now()),
    crossPath: false
  });

  /**
   * Loaded calendar data
   */
  readonly data = signal<CalendarDataResponse | null>(null);

  setParams(update: Partial<CalendarDataRequest>) {
    this.params.update((curr) => ({ ...curr, ...update }));
  };

  constructor() {
    this.testParams(); //TODO: remove in production

    effect(() => {
      const p = this.params();
      this.calendarService.loadEvents(p.date, p.users).subscribe({
        next: (res) => this.data.set(res),
        error: (err) => {
          console.error('Error loading calendar data', err);
          this.data.set(null);
        }
      });
    });
  };

  /**
   * Test setting parameters
   * @private
   */
  private testParams() {
    this.setParams({
      scope: {
        type: 'me',
        contract_id: this.workspaceCtx.currentContractIdStrict()
      },
      granularity: 'day',
      users: ['user_hugo'],
      date: new Date('2025-01-01'),
      crossPath: true
    });
  }
}
