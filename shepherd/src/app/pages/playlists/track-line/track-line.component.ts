import {Component, Input} from '@angular/core';
import {MatIcon} from "@angular/material/icon";

@Component({
  selector: 'app-track-line',
  standalone: true,
    imports: [
        MatIcon
    ],
  templateUrl: './track-line.component.html',
  styleUrl: './track-line.component.scss'
})
export class TrackLineComponent {
 @Input() song: any = {};
}
