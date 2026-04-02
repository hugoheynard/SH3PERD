import {
  Component,
  ElementRef,
  forwardRef,
  HostListener,
  inject,
  input,
} from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { BaseControlValueAccessor } from '../utils/BaseControlValueAccessor';
import { ButtonIconComponent } from '../../button-icon/button-icon.component';
import { SvgIconComponent } from '../../svg-icon/svg-icon.component';

@Component({
  selector: 'sh3-select',
  standalone: true,
  templateUrl: './select.component.html',
  styleUrl: './select.component.scss',
  imports: [ButtonIconComponent, SvgIconComponent],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SelectComponent),
      multi: true,
    }
  ],
  host: { '[attr.data-size]': 'size()' }
})
export class SelectComponent extends BaseControlValueAccessor<string | number | null> {
  public readonly size = input<'small' | 'large'>('large');
  public readonly allowClear = input<boolean>(true);
  public readonly label = input<string>('');
  public readonly placeholder = input<string>('Select');
  public readonly options = input<{ label: string; value: string | number | null }[]>([]);
  private elRef: ElementRef = inject(ElementRef);
  public isOpen: boolean = false;



  toggleDropdown(): void {
    this.isOpen = !this.isOpen;
  };

  selectOption(value: string | number | null): void {
    this.value = value;
    this.isOpen = false;
    return;
  };


  /**
   * Checks if the select component is empty to determine if a placeholder should be shown.
   * @returns {boolean} True if the select component is empty, false otherwise.
   */
  hasValue(): boolean {
    return this.value !== null && this.value !== undefined && this.value !== '' && this.value !== 'null' && this.value !== 0;
  };

  onNativeChange(event: Event): void {
    const selectElement = event.target as HTMLSelectElement;
    this.selectOption(selectElement.value);
    return;
  };

  get selectedLabel(): string {
    return this.options().find(opt => opt.value === this.value)?.label || this.placeholder();
  };

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const clickedInside = this.elRef.nativeElement.contains(event.target);

    if (!clickedInside) {
      this.isOpen = false;
    }
    return;
  };

  /**
   * Clears the selected value when the clear button is clicked.
   * This method stops the event propagation to prevent the dropdown from closing immediately.
   * @param evt
   */
  clear(evt: Event): void {
    evt.stopPropagation();
    this.value = null;
    return;
  }
}
