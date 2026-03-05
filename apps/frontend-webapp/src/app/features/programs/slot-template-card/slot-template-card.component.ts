import { Component, input, output } from '@angular/core';
import type { PerformanceTemplate } from '../services/program-state.service';

@Component({
  selector: 'app-slot-template-card',
  imports: [],
  templateUrl: './slot-template-card.component.html',
  styleUrl: './slot-template-card.component.scss'
})
export class SlotTemplateCardComponent {
  template = input.required<PerformanceTemplate>()
  dragStart = output<PerformanceTemplate>()
  edit = output<PerformanceTemplate>()

  onEdit(event: PointerEvent) {
    event.stopPropagation();   // 🔥 CRUCIAL
    event.preventDefault();
    this.edit.emit(this.template());
  }
}
