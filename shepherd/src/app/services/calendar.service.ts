import {Injectable, signal} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {catchError, firstValueFrom, of} from 'rxjs';

@Injectable({
  providedIn: 'root'
})

export class CalendarService {
  private endpoint = 'http://localhost:3000';
  private token = '';

  calendarDataSignal = signal<any | null>({
    layout: [],
    timestamps: {}});
  constructor(private http: HttpClient) {};

  async getDay(date: string = '2024-12-19'): Promise<any> {

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.token}`,
      'Content-Type': 'application/json',
    });

    const response = await firstValueFrom(
      this.http.post<any>(
        `${this.endpoint}/calendar/date`,
        { date },
        { headers }
      ).pipe(
        catchError((error) => {
          console.error('Error when trying to get day data:', error);
          return of(null);
        })
      )
    );

    this.calendarDataSignal.set(response.data);
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
