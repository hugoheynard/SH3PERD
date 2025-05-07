import {inject, Injectable, signal} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {catchError, firstValueFrom, of} from 'rxjs';

export interface CalendarDataRequest {
  users: string[],
  date: Date[],
  calendarOptions: {
    viewMode: string
    crossPath: boolean
  }
}

@Injectable({ providedIn: 'root'})
export class CalendarService {
  private http: HttpClient = inject(HttpClient);
  private endpoint = 'http://localhost:3000';

  public readonly calendarDataSignal = signal<any | null>({
    layout: [],
    timestamps: {}});

  private calendarDataQueryParamSignal = signal<CalendarDataRequest>({
    date: Date.now(),
    viewMode: 'singlePersonDay',
    crossPath: false
  });

  public setDateQueryParam(date: Date): void {
    this.calendarDataQueryParamSignal.update((prev) => ({
      ...prev,
      date
    }));
  };


  public async getCalendarData(): Promise<any> {
    const params = this.calendarDataQueryParamSignal();

    const response = await firstValueFrom(
      this.http.get<any>(
        `${this.endpoint}/api/calendar/`, {
          params: {
            users: params.users.join(','),
            date: params.date.toISOString(),
            viewMode: params.calendarOptions.viewMode,
            crossPath: String(params.calendarOptions.crossPath)
          },
          headers: new HttpHeaders({ 'Content-Type': 'application/json' })
        },
      ).pipe(
        catchError((error) => {
          console.error('Error when trying to get calendar data:', error);
          return of(null);
        })
      )
    );

    this.calendarDataSignal.set(response);
  } catch (error: any) {
    console.error('Unexpected error in getCalendarData:', error);
    this.calendarDataSignal.set(null);
  }
}
