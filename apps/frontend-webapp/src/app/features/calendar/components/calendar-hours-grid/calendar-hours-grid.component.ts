import {Component, inject, type OnDestroy, type OnInit} from '@angular/core';
import { DatePipe } from '@angular/common';

/**
 * This component displays a grid of hours for a calendar view.
 * It generates time intervals for each hour of the day and highlights the current time.
 * The grid is structured to show each hour with 12 rows representing 5-minute intervals.
 * The current time is highlighted in the grid.
 */
@Component({
  selector: 'app-calendar-hours-grid',
  imports: [],
  providers: [DatePipe],
  templateUrl: './calendar-hours-grid.component.html',
  standalone: true,
  styleUrl: './calendar-hours-grid.component.scss'
})
export class CalendarHoursGridComponent implements OnInit,OnDestroy{
  private datePipe: DatePipe = inject(DatePipe);

  public timeIntervals: { hour: string, rowStart: number, rowEnd: number }[] = [];
  currentHour: string = '';
  currentBarPosition: number = 0;
  intervalId: any;

  ngOnInit(): void {
    this.generateTimeIntervals();
    this.updateCurrentTime();
    //this.intervalId = setInterval(() => this.updateCurrentTime(), 60000);
  };

  ngOnDestroy(): void {
    //clearInterval(this.intervalId);
  };

  generateTimeIntervals(): void {
    // Générer les intervalles de 5 minutes pour chaque heure
    const startTime = 0; // 00:00
    const endTime = 24;  // 24:00 (fin de la journée)

    this.timeIntervals = [];
    let rowStart = 1;

    for (let hour = startTime; hour < endTime; hour++) {
      let hourString = hour < 10 ? '0' + hour : hour.toString();
      let timeString = `${hourString}:00`;

      this.timeIntervals.push({
        hour: timeString,
        rowStart: rowStart,
        rowEnd: rowStart + 12
      });

      rowStart += 12;
    }
  };

  updateCurrentTime(): void {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();

    const formattedHour = this.datePipe.transform(now, 'HH:mm');
    this.currentHour = formattedHour ? formattedHour : '';
    this.currentBarPosition = hours * 12 + Math.floor(minutes / 5) + 1;
  };
}
