import { Component, inject } from '@angular/core';
import { LayoutService } from '../../../core/services/layout.service';

@Component({
  selector: 'app-popover-frame',
  imports: [],
  templateUrl: './popover-frame.component.html',
  styleUrl: './popover-frame.component.scss'
})
export class PopoverFrameComponent {
  private layout = inject(LayoutService);

  close(): void {
    this.layout.clearPopover();
  };
}
