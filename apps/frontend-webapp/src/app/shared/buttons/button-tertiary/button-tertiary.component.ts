import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'sh3-button-tertiary',
  imports: [],
  templateUrl: './button-tertiary.component.html',
  standalone: true,
  styleUrl: './button-tertiary.component.scss',
})
export class ButtonTertiaryComponent {
  @Input() buttonLabel: string = 'Click Me';
  @Input() disabled: boolean = false;
  @Input() onClick?: () => void;
  @Output() clicked: EventEmitter<void> = new EventEmitter<void>();

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
