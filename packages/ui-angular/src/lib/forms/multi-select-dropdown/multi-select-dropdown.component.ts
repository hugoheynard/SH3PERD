import { Component, ElementRef, forwardRef, HostListener, inject, input, Input } from '@angular/core';
import { NgForOf, NgIf } from '@angular/common';
import { type ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';


@Component({
  selector: 'sh3-multi-select-dropdown',
  standalone: true,
  imports: [NgForOf, NgIf],
  templateUrl: './multi-select-dropdown.component.html',
  styleUrl: './multi-select-dropdown.component.scss',
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => MultiSelectDropdownComponent),
    multi: true
  }]
})
export class MultiSelectDropdownComponent implements ControlValueAccessor {
  private _elementRef: ElementRef = inject(ElementRef);

  placeholder= input<string>('Select');
  @Input() options: any[] = [];
  @Input() labelKey: string = '';
  @Input() valueKey: string = '';

  selectedIds: string[] = [];
  dropdownOpen: boolean = false;

  @HostListener('document:click', ['$event.target'])
  onDocumentClick(target: HTMLElement): void {
    const clickedInside = this._elementRef.nativeElement.contains(target);
    if (!clickedInside && this.dropdownOpen) {
      this.closeDropdown();
    }
  };

  closeDropdown(): void {
    this.dropdownOpen = false;
    this.onTouched();
  }

  private onChange: (_: any) => void = () => {};
  private onTouched: () => void = () => {};

  toggleDropdown(): void {
    this.dropdownOpen = !this.dropdownOpen;

    if (!this.dropdownOpen) {
      this.onTouched();
    }
  }

  writeValue(value: string[]): void {
    const newValue = Array.isArray(value) ? [...value] : [];
    const sameValues = this.selectedIds.length === newValue.length &&
      this.selectedIds.every(v => newValue.includes(v));

    if (!sameValues) {
      this.selectedIds = newValue;
    }
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState?(_isDisabled: boolean): void {
    // gérer l'état désactivé si besoin
  }

  onToggle(value: string | null | undefined, checked: boolean): void {
    if (!value) return;

    const updated = checked
      ? [...this.selectedIds, value]
      : this.selectedIds.filter(x => x !== value);

    const same =
      this.selectedIds.length === updated.length &&
      this.selectedIds.every(v => updated.includes(v));

    if (!same) {
      this.selectedIds = updated;
      this.onChange(updated);
    }
  }

  get selectedLabels(): string[] {
    return this.options
      .filter(opt => this.selectedIds.includes(opt[this.valueKey]))
      .map(opt => opt[this.labelKey]);
  }

  isSelected(value: string): boolean {
    return !!value && Array.isArray(this.selectedIds) && this.selectedIds.includes(value);
  };

  onCheckboxChange(event: Event, value: string | null | undefined): void {
    const input = event?.target as HTMLInputElement;
    if (!input || !value) return;

    this.onTouched();
    this.onToggle(value, input.checked);
  }

  isAllSelected(): boolean {
    return this.options.every(opt => this.selectedIds.includes(opt[this.valueKey]));
  }

  toggleSelectAll(checked: boolean): void {
    if (checked) {
      const allValues = this.options.map(opt => opt[this.valueKey]);
      this.selectedIds = [...allValues];
      this.onChange([...allValues]);
    } else {
      this.selectedIds = [];
      this.onChange([]);
    }
  }

  onSelectAllCheckboxChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input) return;

    this.toggleSelectAll(input.checked);
  }
}
