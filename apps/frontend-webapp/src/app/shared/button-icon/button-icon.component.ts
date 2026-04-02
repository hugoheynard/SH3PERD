import { Component, input, model, output } from '@angular/core';
import { SvgIconComponent } from '../svg-icon/svg-icon.component';


@Component({
  selector: 'sh3-button-icon',
  imports: [
    SvgIconComponent,
  ],
  templateUrl: './button-icon.component.html',
  styleUrl: './button-icon.component.scss'
})
export class ButtonIconComponent {
  icon = input.required<string>();
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
