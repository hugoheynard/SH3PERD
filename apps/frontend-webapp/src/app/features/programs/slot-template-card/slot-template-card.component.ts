import { Component, input, output } from '@angular/core';
import type { PerformanceTemplate } from '../services/program-state.service';
import { DragIconComponent } from '../drag-icon/drag-icon.component';

@Component({
  selector: 'app-slot-template-card',
  imports: [
    DragIconComponent,
  ],
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
