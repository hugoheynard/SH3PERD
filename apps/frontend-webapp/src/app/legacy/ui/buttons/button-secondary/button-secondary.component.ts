import { Component, Input, output } from '@angular/core';
import { SvgIconComponent } from '../../icones';
import { NgIf } from '@angular/common';

@Component({
  selector: 'sh3-button-secondary',
  imports: [
    SvgIconComponent,
    NgIf,
  ],
  templateUrl: './button-secondary.component.html',
  standalone: true,
  styleUrl: './button-secondary.component.scss',
})
export class ButtonSecondaryComponent {
  @Input() buttonLabel: string = 'Click Me';
  @Input() icon: string = '';
  @Input() disabled: boolean = false;
  @Input() onClick?: () => void;
  clicked = output<void>();

  handleClick(): void {
    if (this.disabled) {
      return;
    }
    this.clicked.emit();

    if (!this.onClick) {
      return;
    }

    this.onClick();
    return;
  };
}
