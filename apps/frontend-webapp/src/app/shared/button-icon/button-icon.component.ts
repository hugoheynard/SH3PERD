import { Component, input, model, output } from '@angular/core';
import { IconComponent } from '../icon/icon.component';
import type { Sh3IconName } from '../icon/icon.registry';


@Component({
  selector: 'sh3-button-icon',
  imports: [
    IconComponent,
  ],
  templateUrl: './button-icon.component.html',
  styleUrl: './button-icon.component.scss'
})
export class ButtonIconComponent {
  icon = input.required<Sh3IconName>();
  active = model<boolean>(false);
  disabled = input<boolean>(false);
  type = input<'neutral'| 'primary' | 'critical'>('neutral');
  clicked = output<MouseEvent>();

  onClick(e: MouseEvent): void {
    if (this.disabled()) {
      return;
    }
    this.clicked.emit(e);
    this.active.update(v => !v);
    return;
  };
}
