import { Component, computed, inject, input } from '@angular/core';
import { PlannerResolutionService } from '../services/planner-resolution.service';


@Component({
  selector: 'ui-buffer-slot',
  imports: [],
  standalone: true,
  templateUrl: './buffer-slot.component.html',
  styleUrl: './buffer-slot.component.scss',
  host: {
    '[style.top.px]': 'top()',
    '[style.height.px]': 'height()',
  }
})
export class BufferSlotComponent {

  private res = inject(PlannerResolutionService)

  startMinutes = input.required<number>()
  duration = input.required<number>();

  top = computed(() =>
    this.res.minuteToPx(this.startMinutes())
  );

  height = computed(() =>
    this.res.minuteToPx(this.duration())
  );
}
