import { Component, computed, input, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { InputComponent } from '../input/input.component';

/**
 * Password input with live validation rules.
 *
 * Displays a vertical list of password requirements with colored dots:
 * - Amber (warning) when the rule is not met
 * - Teal (primary) when the rule passes
 *
 * @example
 * ```html
 * <sh3-password-field
 *   label="Password"
 *   placeholder="Create a password"
 *   (valueChange)="password.set($event)"
 *   (validChange)="passwordValid.set($event)" />
 * ```
 */
@Component({
  selector: 'sh3-password-field',
  standalone: true,
  imports: [FormsModule, InputComponent],
  templateUrl: './password-field.component.html',
  styleUrl: './password-field.component.scss',
})
export class PasswordFieldComponent {
  readonly label = input('Password');
  readonly placeholder = input('Create a password');
  readonly name = input('password');

  readonly value = signal('');
  readonly valueChange = output<string>();
  readonly validChange = output<boolean>();

  readonly hasMinLength = computed(() => this.value().length >= 8);
  readonly hasUppercase = computed(() => /[A-Z]/.test(this.value()));
  readonly hasLowercase = computed(() => /[a-z]/.test(this.value()));
  readonly hasDigit = computed(() => /\d/.test(this.value()));
  readonly allValid = computed(
    () => this.hasMinLength() && this.hasUppercase() && this.hasLowercase() && this.hasDigit(),
  );

  onInput(val: string): void {
    this.value.set(val);
    this.valueChange.emit(val);
    this.validChange.emit(this.allValid());
  }
}
