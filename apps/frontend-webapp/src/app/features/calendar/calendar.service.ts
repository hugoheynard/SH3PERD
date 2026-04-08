import { inject, Injectable, signal } from '@angular/core';
import type { TUserId, TCalendarDataResponseDTO } from '@sh3pherd/shared-types';
import { UserContextService } from '../../core/services/user-context.service';
import type { TContractId, TUserGroupId } from '@sh3pherd/shared-types';
import { ApiURLService } from '../../core/services/api-url.service';
import { HttpClient } from '@angular/common/http';

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

@Injectable({ providedIn: 'root'})
export class CalendarService {
  private readonly http = inject(HttpClient);
  private readonly UrlBuilder = inject(ApiURLService);
  private URL = this.UrlBuilder.apiProtectedRoute('calendar').build();

  /**
   * Loads calendar events for the specified date and users.
   * @param date
   * @param users
   */
  loadEvents(date: Date, users: TUserId[]) {
    return this.http.post<TCalendarDataResponseDTO>(`${this.URL}`, { date, users });
  };

  private readonly userCtx = inject(UserContextService);

  private readonly params = signal<CalendarDataRequest>({
    users: [],
    scope: {
      type: 'me',
      contract_id: this.userCtx.currentContractIdStrict()
    },
    granularity: 'day',
    date: new Date(),
    crossPath: false
  });

  readonly data = signal<CalendarDataResponse | null>(null);

  setParams(update: Partial<CalendarDataRequest>) {
    this.params.update(curr => ({ ...curr, ...update }));
  }

  /** 🔥 appel EXPLICITE */
  load(): void {
    const p = this.params();

    this.loadEvents(p.date, p.users).subscribe({
      next: res => this.data.set(res),
      error: () => {
        this.data.set(null);
      }
    });
  }
}
