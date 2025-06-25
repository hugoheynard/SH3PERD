import {Injectable, signal} from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class DateService {
  public selectedDateSignal = signal(new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate()));

  setDate(date: Date): void {
    this.selectedDateSignal.set(date);
  };
}
