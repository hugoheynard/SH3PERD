import { Component, input, output } from '@angular/core';
import { CardFrameHorizontalComponent } from '../../../../shared/ui-frames/card-frame/card-frame-horizontal.component';
import { ButtonComponent } from '../../button/button.component';
import type { ArtistPerformanceSlotTemplate } from '../../program-types';

@Component({
  selector: 'ui-slot-template-card',
  imports: [
    CardFrameHorizontalComponent,
    ButtonComponent,

  ],
  templateUrl: './slot-template-card.component.html',
  styleUrl: './slot-template-card.component.scss',
  host: {

  }
})
export class SlotTemplateCardComponent {
  template = input.required<ArtistPerformanceSlotTemplate>()
  dragStart = output<ArtistPerformanceSlotTemplate>()
  edit = output<ArtistPerformanceSlotTemplate>()

  onEdit() {
    this.edit.emit(this.template());
  };
}
