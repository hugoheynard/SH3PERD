import { Component, forwardRef, input, Input, output, } from '@angular/core';
import { FormControl, NG_VALUE_ACCESSOR, ReactiveFormsModule } from '@angular/forms';
import { BaseControlValueAccessor } from '../utils/BaseControlValueAccessor';
/**
 * Input component for forms.
 *
 * @example
 * <sh3-input label="Nom" [(value)]="name"></sh3-input>
 * <sh3-input label="Âge" type="number" [(value)]="age"></sh3-input>
 */
@Component({
  selector: 'sh3-input',
  imports: [
    ReactiveFormsModule,
  ],
  templateUrl: './input.component.html',
  standalone: true,
  styleUrl: './input.component.scss',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => InputComponent),
      multi: true,
    },
  ],
  host: { '[attr.data-size]': 'size()' }
})
export class InputComponent extends BaseControlValueAccessor<string | number> {
  readonly label= input<string>();
  readonly type = input<'text' | 'number' | 'email' | 'password' | 'tel' | 'url'> ('text');
  readonly min= input<number | null>(null);
  readonly max= input<number | null>(null);
  readonly placeholder= input<string>('');
  public readonly size = input<'small' | 'large'>('large')

  /** If FormControl, we use:  */
  @Input() control?: FormControl;

  /** Valeur managée si pas de FormControl */
  valueChange = output<string | number>();

  public inputId: string = crypto.randomUUID();

  /**
  * Handles manual input change
  */
  onInputChange(event: Event) {
    const target = event.target as HTMLInputElement;
    const val = target.value;
    this.value = val;
    this.valueChange.emit(val);
    this.onChange(val);
    this.onTouched();
  };

  /**
   * Increment value by step, respecting max bound
   */
  increment(): void {
    const current = this.getValueAsNumber();
    const max = this.max() ?? Infinity;
    const next = Math.min(current + 1, max);
    this.setValue(next);
  };

  decrement(): void {
    const current = this.getValueAsNumber();
    const min = this.min() ?? -Infinity;
    const next = Math.max(current - 1, min);
    this.setValue(next);
  }

  private getValueAsNumber(): number {
    if (this.control) {
      return Number(this.control.value) || 0;
    }
    return Number(this.value) || 0;
  }

  private setValue(val: number): void {
    if (this.control) {
      this.control.setValue(val);
    } else {
      this.value = val;
      this.valueChange.emit(val);
    }
  }

}
