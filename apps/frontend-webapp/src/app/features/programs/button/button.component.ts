import { booleanAttribute, Component, input, output } from '@angular/core';

export type ButtonVariant = 'primary' | 'secondary' | 'tertiary';

/**
  A simple button component that can be used throughout the app. It supports three variants: primary, secondary and tertiary.
  It also supports a disabled state and a click event. The stopPropagation input can be used to prevent the click event from bubbling up to parent elements.
 */
@Component({
  selector: 'ui-button',
  standalone: true,
  templateUrl: './button.component.html',
  styleUrl: './button.component.scss'
})
export class ButtonComponent {

  variant = input<ButtonVariant>('primary');
  type = input<'button' | 'submit' | 'reset'>('button');
  disabled = input(false);

  stopPropagation = input(false, { transform: booleanAttribute });

  pointerDown = output<PointerEvent>();

  onPointerDown(event: PointerEvent) {

    if (this.stopPropagation()) {
      event.stopPropagation();
    }

    this.pointerDown.emit(event);
  }
}
