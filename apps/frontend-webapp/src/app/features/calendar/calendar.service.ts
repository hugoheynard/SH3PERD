import {Injectable} from '@angular/core';
import { BaseHttpService } from '../../core/services/BaseHttpService';
import type { TUserId, TCalendarDataResponseDTO } from '@sh3pherd/shared-types';



@Injectable({ providedIn: 'root'})
export class CalendarService extends BaseHttpService{
  private URL = this.UrlBuilder.api().route('calendar').build();

  /**
   * Loads calendar events for the specified date and users.
   * @param date
   * @param users
   */
  loadEvents(date: Date, users: TUserId[]) {
    return this.http.post<TCalendarDataResponseDTO>(`${this.URL}`, { date, users });
  };

}
