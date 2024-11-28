import {Component, Input} from '@angular/core';
import {CalendarService} from '../../../services/calendar.service';
import {EventBlockComponent} from '../eventBlock/event-block.component';
import {NgClass, NgForOf, NgIf, NgStyle} from '@angular/common';



@Component({
  selector: 'app-planningGrid',
  standalone: true,
  imports: [
    EventBlockComponent,
    NgStyle,
    NgForOf,
    NgIf,
    NgClass,
  ],
  templateUrl: './planning-grid.component.html',
  styleUrl: './planning-grid.component.scss'
})
export class PlanningGridComponent {
  @Input() events: any[] = [];


  getPosition(date: string) {

    const newDate: Date = new Date(date)
    //calcul des coordonnées rowStart et RowEnd
    const hours: number = newDate.getHours();
    const minutes: number = newDate.getMinutes();
    console.log((hours * 60 + minutes ) / 5 + 1)
    return (hours * 60 + minutes ) / 5 + 1;
  };

  /*
  getPlanningsColumnNumber(internalCollisions: any) {
    const planningColumnNumbers = Object.fromEntries(
      Object.entries(internalCollisions)
        .map(([key, planningCollision]) => [
          key, (1 + planningCollision?.maxCollisions) * 2
        ])
    );
    return Math.max(...Object.values(planningColumnNumbers));
  };
*/
}
