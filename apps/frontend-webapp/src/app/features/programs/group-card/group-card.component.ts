import { Component, input } from '@angular/core';
import { CardFrameComponent } from '../ui-frames/card-frame/card-frame.component';
import type { ArtistGroup } from '../program-types';

@Component({
  selector: 'ui-group-card',
  imports: [
    CardFrameComponent,
  ],
  templateUrl: './group-card.component.html',
  styleUrl: './group-card.component.scss'
})
export class GroupCardComponent {
    group = input.required<ArtistGroup>();
}
