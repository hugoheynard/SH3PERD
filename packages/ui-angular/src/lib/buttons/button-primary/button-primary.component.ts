import { Component, EventEmitter, Input, Output } from '@angular/core';

/**
 * ButtonPrimaryComponent is a reusable Angular component that represents a primary button.
 * Input properties allow customization of the button label, disabled state, and a click handler.
 */
@Component({
  selector: 'sh3-button-primary',
  templateUrl: './button-primary.component.html',
  standalone: true,
  styleUrl: './button-primary.component.scss',
})
export class ButtonPrimaryComponent {
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
