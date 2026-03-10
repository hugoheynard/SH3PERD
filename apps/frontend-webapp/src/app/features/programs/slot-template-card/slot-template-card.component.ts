import { Component, input, output } from '@angular/core';
import { CardFrameComponent } from '../card-frame/card-frame.component';
import { ButtonComponent } from '../button/button.component';
import type { PerformanceTemplate } from '../program-types';

@Component({
  selector: 'ui-slot-template-card',
  imports: [
    CardFrameComponent,
    ButtonComponent,

  ],
  templateUrl: './slot-template-card.component.html',
  styleUrl: './slot-template-card.component.scss'
})
export class SlotTemplateCardComponent {
  template = input.required<PerformanceTemplate>()
  dragStart = output<PerformanceTemplate>()
  edit = output<PerformanceTemplate>()

  onEdit(event: PointerEvent) {
    event.stopPropagation();
    event.preventDefault();
    this.edit.emit(this.template());
  };
}
