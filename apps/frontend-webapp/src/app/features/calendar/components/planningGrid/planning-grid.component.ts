import {Component, Input} from '@angular/core';
import {EventBlockComponent} from '../eventBlock/event-block.component';
import { NgClass } from '@angular/common';



@Component({
    selector: 'app-planningGrid',
    imports: [
    EventBlockComponent,
    NgClass
],
    templateUrl: './planning-grid.component.html',
    standalone: true,
    styleUrl: './planning-grid.component.scss'
})
export class PlanningGridComponent {
  @Input() events: any[] = [];
  @Input() internalCollisions: any;


  getPosition(date: string) {

    const newDate: Date = new Date(date)
    //calcul des coordonnées rowStart et RowEnd
    const hours: number = newDate.getHours();
    const minutes: number = newDate.getMinutes();

    return (hours * 60 + minutes ) / 5 + 1;
  };

  fullGridOrSplit(event: any): string { //TODO bah faire marcher hein

    if (!this.collide(event)) {
      return 'fullWidth'; // Full width
    }

    return 'splitCol';
  };

  collide(event: any): boolean {
    for (const otherEvent of this.events) {
      if (event._id === otherEvent._id) {
        continue; // Ignore l'auto-comparaison
      }
      if ((event.startDate < otherEvent.endDate) && (otherEvent.startDate < event.endDate)) {
        return true; // Collision détectée
      }
    }
    return false; // Aucune collision détectée
  }



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
