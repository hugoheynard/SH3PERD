import { Component } from '@angular/core';
import {EventsGridComponent} from '../Events/events-grid/events-grid.component';

@Component({
  selector: 'app-weekly-planningBlocks',
  imports: [
    EventsGridComponent
  ],
  templateUrl: './weekly-events.component.html',
  standalone: true,
  styleUrl: './weekly-events.component.scss'
})
export class WeeklyEventsComponent {

}
