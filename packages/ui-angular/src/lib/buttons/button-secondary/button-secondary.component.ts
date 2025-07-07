import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'sh3-button-secondary',
  imports: [],
  templateUrl: './button-secondary.component.html',
  standalone: true,
  styleUrl: './button-secondary.component.scss',
})
export class ButtonSecondaryComponent {
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
