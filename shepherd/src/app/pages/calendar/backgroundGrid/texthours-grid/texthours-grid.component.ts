import {Component, Input} from '@angular/core';
import {DatePipe, NgForOf} from "@angular/common";
import {HoursList} from '../../../../interfaces/hours-list';

@Component({
  selector: 'app-texthours-grid',
  standalone: true,
    imports: [
        DatePipe,
        NgForOf
    ],
  templateUrl: './texthours-grid.component.html',
  styleUrl: './texthours-grid.component.scss'
})
export class TexthoursGridComponent {
  @Input() hoursList: HoursList[] = [{timestamp: new Date(), rowStart: 0}];
}
