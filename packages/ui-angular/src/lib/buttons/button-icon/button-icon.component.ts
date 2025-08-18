import { Component, input, model, output } from '@angular/core';
import { SvgIconComponent } from '../../icones';


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
  type = input<'primary' | 'critical'>('primary');
  clicked = output<void>();

  onClick(): void {
    if (this.disabled()) {
      return;
    }
    this.clicked.emit();
    this.active.update(v => !v);
    return;
  };
}
