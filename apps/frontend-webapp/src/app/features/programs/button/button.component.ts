import { Component, input } from '@angular/core';

export type ButtonVariant = 'primary' | 'secondary' | 'tertiary';

@Component({
  selector: 'app-button',
  standalone: true,
  templateUrl: './button.component.html',
  styleUrl: './button.component.scss'
})
export class ButtonComponent {

  variant = input<ButtonVariant>('primary');
  type = input<'button' | 'submit' | 'reset'>('button');
  disabled = input(false);
}
