import { Component, EventEmitter, forwardRef, Input, Output, TemplateRef } from '@angular/core';
import { NgForOf, NgIf, NgTemplateOutlet } from '@angular/common';
import { BaseControlValueAccessor } from '../utils/BaseControlValueAccessor';
import { NG_VALUE_ACCESSOR } from '@angular/forms';


/**
 * Example usage of the <sh3-select-list> component in a reactive form.
 *
 * This component supports both single and multi-selection modes.
 * It integrates with Angular forms using ControlValueAccessor.
 *
 * @example
 * <sh3-select-list
 *   formControlName="musicReference_id"
 *   [ngStyle]="{ gridColumn: musicRefFormOpen() ? 'span 1' : 'span 2' }"
 *   [items]="musicRefsSuggestions()"
 *   [trackByFn]="trackByMusicRef"
 *   [labelFn]="labelForMusicRef"
 *   [valueFn]="trackByMusicRef"
 *   [maxSelection]="1"
 *   [emptyTemplate]="customEmptyTpl"
 * />
 *
 * @description
 * - `items`: Array of selectable items.
 * - `trackByFn`: Function to extract a unique identifier from each item (used for selection tracking).
 * - `labelFn`: Function to display a label for each item.
 * - `valueFn`: Function to transform the selected item(s) into the form control value.
 * - `maxSelection`: Set to `1` for single selection (the returned value will still be an array).
 *
 * @note
 * Even in single-selection mode, the `ControlValueAccessor` returns an array of values.
 * For example: `['music_ref_123']` instead of `'music_ref_123'`.
 * Consumers should handle this consistently within the form model.
 */
@Component({
  selector: 'sh3-select-list',
  imports: [
    NgForOf,
    NgIf,
    NgTemplateOutlet,
  ],
  templateUrl: './select-list.component.html',
  standalone: true,
  styleUrl: './select-list.component.scss',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SelectListComponent),
      multi: true,
    },
  ],
})
export class SelectListComponent<T> extends BaseControlValueAccessor<any> {
  /**
   * Array of items to display in the list.
   */
  @Input({ required: true }) items: T[] = [];

  /**
   * Maximum number of items to display before scrolling is enabled.
   * Expressed as a multiplier of item height (approx. 2.5rem each).
   */
  @Input() maxItemsVisible: number = 5;

  /**
   * Maximum number of items that can be selected.
   * If undefined, the list behaves as a single-select component.
   */
  @Input() maxSelection?: number;

  /**
   * Function used to extract a unique identifier from each item.
   * Defaults to `(item) => item.id`.
   */
  @Input({ required: true }) trackByFn!: (item: T) => any;

  /**
   * Function used to generate a display label for each item.
   * Should look like  `(item) => item.toString()`.
   */
  @Input({ required: true }) labelFn!: (item: T) => string;

  /**
   * Function used to extract a value from each item.
   * Defaults to `(item) => item`.
   */
  @Input() valueFn: (item: T) => unknown = item => item;

  /**
   * Emits the list of currently selected items whenever selection changes.
   */
  @Output() selectionChange = new EventEmitter<T[]>();

  @Input() emptyTemplate?: TemplateRef<unknown>;

  // Valeur interne utilisée pour tracking visuel
  private internalSelection: T[] = [];

  /**
   * Handles user selection of an item.
   * In multi-select mode, toggles the item and enforces max selection limit.
   * In single-select mode, emits the selected item.
   * @param item The item that was selected or deselected.
   */
  onSelect(item: T): void {
    const id = this.trackByFn(item);
    const exists = this.internalSelection.some(i => this.trackByFn(i) === id);

    if (!this.maxSelection) {
      this.internalSelection = [item];
      this.value = this.valueFn(item);
      this.onChange(this.value);
      return;
    }

    const updated = exists
      ? this.internalSelection.filter(i => this.trackByFn(i) !== id)
      : this.internalSelection.length < this.maxSelection
        ? [...this.internalSelection, item]
        : this.internalSelection;

    this.internalSelection = updated;
    this.value = updated.map(this.valueFn); // seul moment où on transforme
    this.onChange(this.value);
    return;
  };

  /**
   * Determines if a given item is currently selected.
   * @param item The item to check.
   * @returns True if the item is selected.
   */
  isSelected(item: T): boolean {
    const id = this.trackByFn(item);
    return this.maxSelection
      ? (this.value as unknown[] ?? []).includes(id)
      : this.value === id;
  }

  /**
   * Determines if an item is disabled due to max selection being reached.
   * @param item The item to check.
   * @returns True if the item cannot be selected.
   */
  isDisabled(item: T): boolean {
    if (!this.maxSelection) return false;

    const id = this.trackByFn(item);
    const selected = (this.value as unknown[] ?? []);
    return !selected.includes(id) && selected.length >= this.maxSelection;
  }
}
