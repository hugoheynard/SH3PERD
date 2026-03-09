import { Component } from '@angular/core';
import { PopoverFrameComponent } from '../popover-frame/popover-frame.component';
import { ButtonComponent } from '../button/button.component';

@Component({
  selector: 'app-edit-template-popover',
  imports: [
    PopoverFrameComponent,
    ButtonComponent,
  ],
  templateUrl: './edit-template-popover.component.html',
  styleUrl: './edit-template-popover.component.scss'
})
export class EditTemplatePopoverComponent {
  close(): void {}
}
