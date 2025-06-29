import { Component, forwardRef, Input } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { BaseControlValueAccessor } from '../utils/BaseControlValueAccessor';


@Component({
  selector: 'sh3-checkbox',
  templateUrl: './checkbox.component.html',
  standalone: true,
  styleUrl: './checkbox.component.scss',
  imports: [],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CheckboxComponent),
      multi: true
    }
  ]
})
export class CheckboxComponent extends BaseControlValueAccessor<boolean> {
  @Input() label: string = 'Check';
  onCheckboxChange(event: Event): void {
    const input: HTMLInputElement = event.target as HTMLInputElement;
    this.value = input.checked;
  };
}