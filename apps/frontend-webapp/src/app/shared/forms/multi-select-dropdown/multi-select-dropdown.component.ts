import { Component, ElementRef, forwardRef, HostListener, inject, input} from '@angular/core';
import { type ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { SvgIconComponent } from '../../svg-icon/svg-icon.component';

type Opt = Record<string, any>;

@Component({
  selector: 'sh3-multi-select-dropdown',
  imports: [
    SvgIconComponent,
  ],
  standalone: true,
  templateUrl: './multi-select-dropdown.component.html',
  styleUrl: './multi-select-dropdown.component.scss',
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => MultiSelectDropdownComponent),
    multi: true
  }],
  host: { '[attr.data-size]': 'size()' }
})
export class MultiSelectDropdownComponent implements ControlValueAccessor {
  private el = inject(ElementRef<HTMLElement>);

  // API
  size = input<'small' | 'large'>('large');
  placeholder = input<string>('Select');
  options = input.required<Opt[]>();
  /** clés des propriétés d'option */
  valueKey = input<string>('value');
  labelKey = input<string>('label');

  // State
  selectedIds: (string | number)[] = [];
  dropdownOpen = false;
  disabled = false;


  // --------- CVA ----------
  private onChange: (v: (string | number)[]) => void = () => {};
  private onTouched: () => void = () => {};

  writeValue(value: (string | number)[] | null | undefined): void {
    this.selectedIds = Array.isArray(value) ? [...value] : [];
  };
  registerOnChange(fn: (v:(string | number)[]) => void): void {
    this.onChange = fn;
  }
  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }
  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  };

  // -------- interactions
  onCheckboxChange(event: Event, val: string | null | undefined): void {
    const inputEl = event.target as HTMLInputElement | null;
    if (!inputEl || !val) {
      return;
    }
    this.onTouched();
    this.onToggle(val, inputEl.checked);

    return;
  };

  onToggle(val: string | number, checked: boolean): void {
    const next = checked
      ? [...this.selectedIds, val]
      : this.selectedIds.filter(x => x !== val);

    this.selectedIds = next;
    this.onChange([...next]);
    return;
  };

  /**
   * Checks if the given value is selected.
   * @param val
   */
  isSelected(val: string | number): boolean {
    return this.selectedIds.includes(val);
  };

  /**
   * Checks if all options are selected.
   * @returns {boolean} True if all options are selected, false otherwise.
   */
  isAllSelected(): boolean {
    const vk = this.valueKey();
    const opts = this.options?.() ?? [];
    return opts.length > 0 && opts
      .every(o => this.selectedIds.includes(o[vk]))
  };

  /**
   * Toggles the selection of all options.
   * If all options are selected, it deselects them; otherwise, it selects all.
   * @param checked - Whether to select or deselect all options.
   */
  toggleSelectAll(checked: boolean): void {
    const opts = this.options?.() ?? [];
    const vk = this.valueKey();
    const next = checked ? opts.map(o => o[vk]) : [];
    this.selectedIds = next;
    this.onChange([...next]);
    this.onTouched();
  }

  onSelectAllCheckboxChange(event: Event): void {
    const inputEl = event.target as HTMLInputElement | null;
    if (!inputEl) return;
    this.toggleSelectAll(inputEl.checked);
  }

  // -------- utils
  get selectedLabels(): string[] {
    const opts = this.options?.() ?? [];
    const vk = this.valueKey();
    const lk = this.labelKey();
    const set = new Set(this.selectedIds);

    return opts
      .filter(o => set.has(o[vk]))
      .map(o => String(o[lk]));
  };

  trackByValue = (_: number, o: Opt) => String(o[this.valueKey()]);

  // --- Close dropdown on outside click ---
  @HostListener('document:click', ['$event'])
  onDocumentClick(ev: MouseEvent): void {
    const inside = this.el.nativeElement.contains(ev.target as Node);

    if (!inside && this.dropdownOpen) {
      this.closeDropdown();
      return;
    }
    return;
  };

  // ---------- UI ----------
  toggleDropdown(): void {
    this.dropdownOpen = !this.dropdownOpen;

    if (!this.dropdownOpen) {
      this.onTouched();
      return;
    }
    return;
  };

  closeDropdown(): void {
    this.dropdownOpen = false;
    this.onTouched();
    return;
  };
}
