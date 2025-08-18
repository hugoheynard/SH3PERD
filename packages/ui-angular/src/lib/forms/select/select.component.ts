import { Component, ElementRef, forwardRef, HostListener, inject, input, Input } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { NgForOf, NgIf } from '@angular/common';
import { BaseControlValueAccessor } from '../utils/BaseControlValueAccessor';

@Component({
  selector: 'sh3-select',
  standalone: true,
  templateUrl: './select.component.html',
  styleUrl: './select.component.scss',
  imports: [NgForOf, NgIf],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SelectComponent),
      multi: true,
    }
  ]
})
export class SelectComponent extends BaseControlValueAccessor<string | number | null> {
  public readonly size = input<'small' | 'large'>('large');

  @Input() label: string = '';
  @Input() placeholder: string = 'Select';
  @Input() options: { label: string; value: string | number | null }[] = [];
  private elRef: ElementRef = inject(ElementRef);
  public isOpen: boolean = false;

  toggleDropdown(): void {
    this.isOpen = !this.isOpen;
  };

  selectOption(value: string | number | null): void {
    this.value = value;
    this.isOpen = false;
  };

  onNativeChange(event: Event): void {
    const selectElement = event.target as HTMLSelectElement;
    this.selectOption(selectElement.value);
  };

  get selectedLabel(): string {
    return this.options.find(opt => opt.value === this.value)?.label || this.placeholder;
  };

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const clickedInside = this.elRef.nativeElement.contains(event.target);

    if (!clickedInside) {
      this.isOpen = false;
    }
  };
}
