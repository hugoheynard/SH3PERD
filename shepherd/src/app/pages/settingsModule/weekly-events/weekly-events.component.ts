import { Component } from '@angular/core';
import {EventsGridComponent} from '../Events/events-grid/events-grid.component';

@Component({
    selector: 'app-weekly-events',
    imports: [
        EventsGridComponent
    ],
    templateUrl: './weekly-events.component.html',
    styleUrl: './weekly-events.component.scss'
})
export class WeeklyEventsComponent {

}
