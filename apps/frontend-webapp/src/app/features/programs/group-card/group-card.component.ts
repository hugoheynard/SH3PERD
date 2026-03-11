import { Component, input } from '@angular/core';
import { CardFrameHorizontalComponent } from '../ui-frames/card-frame/card-frame-horizontal.component';
import type { UserGroup } from '../program-types';

@Component({
  selector: 'ui-group-card',
  imports: [
    CardFrameHorizontalComponent,
  ],
  templateUrl: './group-card.component.html',
  styleUrl: './group-card.component.scss'
})
export class GroupCardComponent {
    group = input.required<UserGroup>();
}
