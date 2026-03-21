import { Component, computed, inject } from '@angular/core';
import { INJECTION_DATA } from '../../../../core/main-layout/main-layout.component';
import { PopoverFrameComponent } from '../../ui-frames/popover-frame/popover-frame.component';
import { ButtonComponent } from '../../button/button.component';
import { PlannerSelectorService } from '../../services/selector-layer/planner-selector.service';


@Component({
  selector: 'ui-edit-performance-slot-popover',
  imports: [
    PopoverFrameComponent,
    ButtonComponent,
  ],
  templateUrl: './edit-performance-slot-popover.component.html',
  styleUrl: './edit-performance-slot-popover.component.scss'
})
export class EditPerformanceSlotPopoverComponent {
  private selector = inject(PlannerSelectorService)

  private config = inject<{ id: string }>(INJECTION_DATA);

  slot = computed(() =>
    this.selector.slots().find(s => s.id === this.config.id)
  );


}
