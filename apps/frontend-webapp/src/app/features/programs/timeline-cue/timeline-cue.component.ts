import { Component, input } from '@angular/core';

@Component({
  selector: 'ui-timeline-cue',
  standalone: true,
  templateUrl: './timeline-cue.component.html',
  styleUrl: './timeline-cue.component.scss',
  host: {
    '[style.top.px]': 'top()',
    '[attr.data-type]': 'type()'
  }
})
export class TimelineCueComponent {

  /**
   * Vertical position in px (computed from minutes)
   */
  top = input.required<number>();

  /**
   * Display label of the cue
   */
  label = input.required<string>();

  /**
   * Optional cue type for styling
   */
  type = input<'default' | 'technical' | 'artistic' | 'logistic'>('default');
}
