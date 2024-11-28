import {inject, Injectable, signal} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {catchError, firstValueFrom, of} from 'rxjs';

export interface CalendarDataRequest {
  users: string[],
  date: string[],
  calendarOptions: {
    viewMode: string
    crossPath: boolean
  }
}

@Injectable({
  providedIn: 'root'
})

export class CalendarService {
  private http: HttpClient = inject(HttpClient);
  private endpoint = 'http://localhost:3000';
  private token = '';

  calendarDataSignal = signal<any | null>({
    layout: [],
    timestamps: {}});


  async getCalendarData(calendarDataRequest: CalendarDataRequest): Promise<any> {

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.token}`,
      'Content-Type': 'application/json',
    });

    const response = await firstValueFrom(
      this.http.post<any>(
        `${this.endpoint}/calendar/`,
        { calendarDataRequest },
        { headers }
      ).pipe(
        catchError((error) => {
          console.error('Error when trying to get day data:', error);
          return of(null);
        })
      )
    );

    this.calendarDataSignal.set(response);
  } catch (error: any) {
    console.error('Error in method getDay:', error);
    this.calendarDataSignal.set(null);
  }
/*
      const { events, specs } = response.data;

      // Data Processing
      // Convert date back from string to Date Object
      for (const key in events) {
        const event = events[key];
        if (event.date) {
          event.date = new Date(event.date);
        }
      }

      for (const key in specs.timestamps) {
        const spec = specs.timestamps[key];
        if (!(spec instanceof Date)) {
          specs.timestamps[key] = new Date(spec);
        }
      }

      console.log(response.data);
      return response.data;
*/
}
