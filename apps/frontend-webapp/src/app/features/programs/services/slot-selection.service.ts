import { Injectable, signal } from '@angular/core';

/**
 * Manages the selection state of performance slots in the timeline.
 *
 * This service is responsible for tracking which slots are currently selected
 * in the planner UI. It supports single selection and multi-selection and
 * exposes a reactive signal that components can subscribe to in order to
 * update their visual state (e.g. slot highlight).
 *
 * The selection model is based on a `Set<string>` containing slot IDs.
 * This ensures constant time lookup for selection checks and prevents
 * duplicate entries.
 *
 * Typical interactions using this service:
 *
 * - Single click → select one slot
 * - Ctrl/Cmd + click → toggle multi-selection
 * - Drag selected slot → move all selected slots
 * - Delete key → remove selected slots
 * - Duplicate shortcut → duplicate selected slots
 *
 * The service intentionally contains **no UI logic** and only manages state.
 */
@Injectable({ providedIn: 'root' })
export class SlotSelectionService {

  /**
   * Internal reactive state storing selected slot IDs.
   */
  private _selected = signal<Set<string>>(new Set());

  /**
   * Read-only signal exposing the current selection.
   * Components can subscribe to this signal to reactively update
   * selection visuals (e.g. glow around selected slots).
   */
  readonly selected = this._selected.asReadonly();

  /**
   * Selects or toggles a slot.
   *
   * @param id - The slot ID to select.
   * @param multi - If true, keeps the existing selection and toggles the slot.
   *                If false, clears the previous selection before selecting.
   */
  select(id: string, multi = false) {

    const next = new Set(this._selected());

    if (!multi) {
      next.clear();
    }

    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }

    this._selected.set(next);
  }

  /**
   * Clears the current selection.
   */
  clear() {
    this._selected.set(new Set());
  };

  /**
   * Checks whether a slot is currently selected.
   *
   * @param id - Slot ID to check.
   * @returns True if the slot is part of the current selection.
   */
  isSelected(id: string) {
    return this._selected().has(id);
  };

  /**
   * Returns all selected slot IDs as an array.
   *
   * Useful for batch operations such as delete, duplicate,
   * or grouped drag operations.
   */
  getSelectedIds() {
    return Array.from(this._selected());
  };
}
