import {Component, Input} from '@angular/core';
import {NgForOf} from '@angular/common';
import {HoursList} from '../../../../interfaces/hours-list';

@Component({
  selector: 'app-lines-grid',
  standalone: true,
  imports: [
    NgForOf
  ],
  templateUrl: './lines-grid.component.html',
  styleUrl: './lines-grid.component.scss'
})
export class LinesGridComponent {
  @Input() hoursList: HoursList[] = [{timestamp: new Date(), rowStart: 0}];
}
