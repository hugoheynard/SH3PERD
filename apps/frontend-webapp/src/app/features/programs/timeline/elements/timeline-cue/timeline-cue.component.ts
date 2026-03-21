import { Component, computed, HostBinding, inject, input } from '@angular/core';
import type { TimelineCue } from '../../../program-types';
import { PlannerResolutionService } from '../../../services/planner-resolution.service';

@Component({
  selector: 'ui-timeline-cue',
  standalone: true,
  templateUrl: './timeline-cue.component.html',
  styleUrl: './timeline-cue.component.scss',
})
export class TimelineCueComponent {
  private res = inject(PlannerResolutionService);


  @HostBinding('style.top.px') get topPx() {
    return this.top();
  }

  @HostBinding('attr.data-type') get cueType() {
    return this.type();
  }

  cue = input.required<TimelineCue>();
  /**
   * Vertical position in px (computed from minutes)
   */
  top = computed(() => this.res.minuteToPx(this.cue().atMinutes));

  /**
   * Display label of the cue
   */
  label =computed(() => this.cue().label);

  /**
   * Optional cue type for styling
   */
  type = input<'default' | 'technical' | 'artistic' | 'logistic'>('default');

  /**
   * Indicates selection state
   */
  isSelected = input(false);
}
