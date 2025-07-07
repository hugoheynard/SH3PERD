import { Component, EventEmitter, Input, Output, TemplateRef } from '@angular/core';
import { NgForOf, NgIf, NgTemplateOutlet } from '@angular/common';


/**
 * Generic selection list component.
 * Supports single or multiple selection with a maximum limit.
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
})
export class SelectListComponent<T> {
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
   * List of selected item IDs (used in multi-select mode).
   */
  @Input() selectedIds: (string | number)[] = [];

  /**
   * Currently selected item ID (used in single-select mode).
   */
  @Input() selectedId: string | number | null = null;

  /**
   * Function used to extract a unique identifier from each item.
   * Defaults to `(item) => item.id`.
   */
  @Input({ required: true }) trackByFn: (item: T) => string | number = (item: any) => item?.id;

  /**
   * Function used to generate a display label for each item.
   * Defaults to `(item) => item.toString()`.
   */
  @Input({ required: true }) labelFn: (item: T) => string = (item: any) => item?.toString();

  /**
   * Emits the list of currently selected items whenever selection changes.
   */
  @Output() selectionChange = new EventEmitter<T[]>();

  @Input() emptyTemplate?: TemplateRef<unknown>;


  /**
   * Handles user selection of an item.
   * In multi-select mode, toggles the item and enforces max selection limit.
   * In single-select mode, emits the selected item.
   * @param item The item that was selected or deselected.
   */
  onSelect(item: T): void {
    const id = this.trackByFn(item);
    if (this.maxSelection) {
      const exists = this.selectedIds.includes(id);
      const newSelection = exists
        ? this.selectedIds.filter(i => i !== id)
        : this.selectedIds.length < this.maxSelection
          ? [...this.selectedIds, id]
          : this.selectedIds;

      this.selectionChange.emit(this.items.filter(i => newSelection.includes(this.trackByFn(i))));
    } else {
      this.selectionChange.emit([item]);
    }
  }

  /**
   * Determines if a given item is currently selected.
   * @param item The item to check.
   * @returns True if the item is selected.
   */
  isSelected(item: T): boolean {
    const id = this.trackByFn(item);
    return this.maxSelection ? this.selectedIds.includes(id) : id === this.selectedId;
  };

  /**
   * Determines if an item is disabled due to max selection being reached.
   * @param item The item to check.
   * @returns True if the item cannot be selected.
   */
  isDisabled(item: T): boolean {
    const id = this.trackByFn(item);
    return !! (
      this.maxSelection &&
      !this.selectedIds.includes(id) &&
      this.selectedIds.length >= this.maxSelection
    );
  };
}
