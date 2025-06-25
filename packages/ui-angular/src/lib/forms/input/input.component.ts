import { Component, EventEmitter, forwardRef, Input, Output } from '@angular/core';
import { ControlValueAccessor, FormControl, NG_VALUE_ACCESSOR, ReactiveFormsModule } from '@angular/forms';
import { NgIf } from '@angular/common';
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
    NgIf,
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
})
export class InputComponent
  extends BaseControlValueAccessor<string | number> {
  @Input() label!: string;
  @Input() type: 'text' | 'number' | 'email' | 'password' | 'tel' | 'url' = 'text';
  @Input() min?: number;
  @Input() max?: number;
  @Input() placeholder?: string;

  /** If FormControl, we use:  */
  @Input() control?: FormControl;

  /** Valeur managée si pas de FormControl */
  @Output() valueChange = new EventEmitter<string | number>();

  public inputId: string = crypto.randomUUID();


  onInputChange(event: Event) {
    const target = event.target as HTMLInputElement;
    const val = target.value;
    this.value = val;
    this.valueChange.emit(val);
    this.onChange(val);
    this.onTouched();
  }
}
