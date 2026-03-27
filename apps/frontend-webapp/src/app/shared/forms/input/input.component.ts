import { Component, forwardRef, input, output } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { BaseControlValueAccessor } from '../utils/BaseControlValueAccessor';

/**
 * Shared text input component — design system entry point for all text-like form fields.
 *
 * Supports `ngModel`, `formControl`, or standalone `(valueChange)` binding.
 * Variant, size and alignment are applied as host classes (`:host(.sm.center)`).
 *
 * @selector `sh3-input`
 *
 * @example
 * ```html
 * <!-- Basic text input with ngModel -->
 * <sh3-input placeholder="Version name…" [(ngModel)]="label" />
 *
 * <!-- Number input, small, centered -->
 * <sh3-input type="number" size="sm" align="center" min="1" placeholder="BPM" [(ngModel)]="bpm" />
 *
 * <!-- Readonly input -->
 * <sh3-input [value]="title" [readonly]="true" />
 *
 * <!-- With explicit width via host style -->
 * <sh3-input style="width: 60px" type="number" size="sm" align="center" placeholder="min" />
 * ```
 */
@Component({
  selector: 'sh3-input',
  standalone: true,
  templateUrl: './input.component.html',
  styleUrl: './input.component.scss',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => InputComponent),
      multi: true,
    },
  ],
  host: {
    '[class]': 'size() + " " + align()',
  },
})
export class InputComponent extends BaseControlValueAccessor<string | number> {
  /**
   * Native input type.
   * @default 'text'
   */
  readonly type = input<'text' | 'number' | 'email' | 'password' | 'tel' | 'url'>('text');

  /**
   * Size preset controlling height, font-size, padding and border-radius.
   * - `sm` — compact (text-sm, tight padding) — inline table edits, compact forms
   * - `md` — standard (text-md) — default form fields
   * - `lg` — large (text-lg, generous padding) — prominent inputs
   * @default 'md'
   */
  readonly size = input<'sm' | 'md' | 'lg'>('md');

  /**
   * Text alignment inside the input.
   * - `start` — left-aligned (default for text)
   * - `center` — centered (useful for short number fields like BPM, duration)
   * @default 'start'
   */
  readonly align = input<'start' | 'center'>('start');

  /** Placeholder text. */
  readonly placeholder = input('');

  /** Whether the input is read-only. */
  readonly readonly = input(false);

  /** Whether to autofocus on mount. */
  readonly autofocus = input(false);

  /** Minimum value (number inputs). */
  readonly min = input<number | null>(null);

  /** Maximum value (number inputs). */
  readonly max = input<number | null>(null);

  /** Emitted on every input change (for non-CVA usage). */
  readonly valueChange = output<string | number>();

  /** Unique ID for label association. */
  readonly inputId = crypto.randomUUID();

  /** Handles native input event. */
  onInputChange(event: Event): void {
    const val = (event.target as HTMLInputElement).value;
    const parsed = this.type() === 'number' && val !== '' ? Number(val) : val;
    this.value = parsed;
    this.valueChange.emit(parsed);
    this.onChange(parsed);
    this.onTouched();
  }
}
