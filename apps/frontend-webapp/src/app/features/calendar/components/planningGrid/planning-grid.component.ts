import { Component, input } from '@angular/core';
import {EventBlockComponent} from '../eventBlock/event-block.component';
import { NgClass } from '@angular/common';
import type { TEventUnitDomainModel } from '@sh3pherd/shared-types';



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
  public readonly events = input.required<TEventUnitDomainModel[]>();
  public readonly internalCollisions = input<any>();


  /**
   * Calculate the grid position for a given date for rowStart and rowEnd
   * @param date
   */
  getPosition(date: Date): number {
    const newDate: Date = new Date(date)
    const hours: number = newDate.getHours();
    const minutes: number = newDate.getMinutes();

    return (hours * 60 + minutes ) / 5 + 1;
  };

  /**
   * Determines if the event should take full width or split column based on collisions
   * @param event
   */
  fullGridOrSplit(event: TEventUnitDomainModel): 'fullWidth' | 'splitCol' { //TODO bah faire marcher hein
    if (!this.collide(event)) {
      return 'fullWidth';
    }

    return 'splitCol';
  };

  /**
   * Check if the event collides with any other event in the list
   * @param event
   */
  collide(event: TEventUnitDomainModel): boolean {
    for (const otherEvent of this.events()) {
      if (event.id === otherEvent.id) {
        continue;
      }
      if ((event.startDate < otherEvent.endDate) && (otherEvent.startDate < event.endDate)) {
        return true;
      }
    }
    return false;
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
