import { Component, computed, HostBinding, inject, input } from '@angular/core';
import { PlannerResolutionService } from '../../../services/planner-resolution.service';
import type { TimelineBuffer } from '../../../program-types';


@Component({
  selector: 'ui-buffer-slot',
  imports: [],
  standalone: true,
  templateUrl: './buffer-slot.component.html',
  styleUrl: './buffer-slot.component.scss',
})
export class BufferSlotComponent {

  // ----------------- DEPS -----------------//
  private res = inject(PlannerResolutionService)

  // ----------------- HOST BINDING -----------------//
  @HostBinding('style.top.px') get topPx() {
    return this.top();
  }

  @HostBinding('style.height.px') get heightPx() {
    return this.height();
  }

  // ----------------- I/O -----------------//
  buffer = input.required<TimelineBuffer>();

// ----------------- STATES -----------------//
  top = computed(() =>
    this.res.minuteToPx(this.buffer().atMinutes)
  );

  height = computed(() =>
    this.res.minuteToPx(this.buffer().delta)
  );

  duration = computed(() => this.buffer().delta);
}
