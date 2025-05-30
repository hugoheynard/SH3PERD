import {Component, EventEmitter, Input, Output} from '@angular/core';
import {NgForOf, NgIf} from '@angular/common';

export interface SelectOption {
  id: string;
  label: string;
}

@Component({
  selector: 'app-multi-select-dropdown',
  imports: [
    NgForOf,
    NgIf
  ],
  templateUrl: './multi-select-dropdown.component.html',
  standalone: true,
  styleUrl: './multi-select-dropdown.component.scss'
})
export class MultiSelectDropdownComponent {
  @Input() options: SelectOption[] = [];
  @Input() labelKey: string = '';
  @Input() valueKey: string = '';
  @Input() selectedIds: string[] = [];
  @Output() selectionChange: EventEmitter<string[]> = new EventEmitter<string[]>();
  public dropdownOpen: boolean = false;

  toggleDropdown(): void {
    this.dropdownOpen = !this.dropdownOpen;
  }

  getOptionValue(option: any): string {
    return option[this.valueKey];
  }

  getOptionLabel(option: any): string {
    return option[this.labelKey];
  }

  isSelected(value: string): boolean {
    return this.selectedIds.includes(value);
  }

  onToggle(value: string, checked: boolean): void {
    const updated = checked
      ? [...this.selectedIds, value]
      : this.selectedIds.filter(x => x !== value);
    this.selectionChange.emit(updated);
  }

  get selectedLabels(): string[] {
    return this.options
      .filter(opt => this.selectedIds.includes(this.getOptionValue(opt)))
      .map(opt => this.getOptionLabel(opt));
  }
}
