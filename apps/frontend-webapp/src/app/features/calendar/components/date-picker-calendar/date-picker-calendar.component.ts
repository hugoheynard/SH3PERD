import {Component, effect} from '@angular/core';
import {provideNativeDateAdapter} from '@angular/material/core';
import {NgClass, NgForOf} from '@angular/common';
import {DateService} from '../../../../services/date.service';

@Component({
    selector: 'app-date-picker-calendar',
    providers: [provideNativeDateAdapter()],
    imports: [NgForOf, NgClass],
    templateUrl: './date-picker-calendar.component.html',
    standalone: true,
    styleUrl: './date-picker-calendar.component.scss'
})

export class DatePickerCalendarComponent {
  public currentYear: number = new Date().getFullYear();
  public currentMonth: number = new Date().getMonth();
  public currentDay: number = new Date().getDate();
  public currentWeekDay: number = new Date().getDay();
  public firstDay: number = new Date(this.currentYear, this.currentMonth, 1).getDay();
  public selectedDate: any;
  constructor(private dateService: DateService) {
    effect(() => {
      this.selectedDate = this.dateService.selectedDateSignal();
      this.updateCalendar(this.selectedDate);
    });
  }

  private updateCalendar(date: Date): void {
    this.currentYear = date.getFullYear();
    this.currentMonth = date.getMonth();
    this.currentDay = date.getDate();
    this.firstDay = new Date(this.currentYear, this.currentMonth, 1).getDay();
  };

  public monthArray: string[] = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  prevMonth() {
    if (this.currentMonth === 0) {
      this.currentMonth = 11;
      this.currentYear--;
    } else {
      this.currentMonth--;
    }
  };

  nextMonth() {
    if (this.currentMonth === 11) {
      this.currentMonth = 0;
      this.currentYear++;
    } else {
      this.currentMonth++;
    }
  };

  get emptyDaysArray(): number[] {
    return Array(this.firstDay).fill(0);
  };

  get daysInMonth(): Date[] {
    const days: Date[] = [];
    const numberOfDays = new Date(this.currentYear, this.currentMonth + 1, 0).getDate(); // Gets days in the month
    for (let day = 1; day <= numberOfDays; day++) {
      days.push(new Date(this.currentYear, this.currentMonth, day));
    }
    return days;
  }

  selectDate(date: Date): void {
    this.dateService.setDate(date)
  };
}
