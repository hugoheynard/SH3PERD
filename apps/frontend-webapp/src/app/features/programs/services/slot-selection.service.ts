import { Injectable, signal } from '@angular/core';


/**
 * Manages the selection state of performance slots within the planner timeline.
 *
 * This service centralizes all slot selection logic used by the UI, including:
 *
 * - **Single selection** (click)
 * - **Multi-selection** (Ctrl / Cmd + click)
 * - **Range selection** (Shift + click)
 *
 * The selection state is stored as a `Set<string>` of slot IDs to guarantee
 * fast lookup and prevent duplicates.
 *
 * Internally the service tracks two additional concepts commonly used in
 * timeline and editor UIs:
 *
 * - **anchorId** — the reference slot used as the starting point for range selections.
 * - **focusId** — the most recently interacted slot.
 *
 * This architecture mirrors the behavior found in professional editors
 * such as Figma, Linear, Notion or Ableton timelines.
 *
 * The service contains **no UI logic** and only manages state. Components
 * subscribe to the exposed signal to update visual feedback (selection glow,
 * multi-drag behavior, keyboard actions, etc.).
 */
@Injectable({ providedIn: 'root' })
export class SlotSelectionService {

  /**
   * Internal reactive state storing selected slot IDs.
   */
  private _selected = signal<Set<string>>(new Set());

  /**
   * Read-only signal exposing the current selection.
   * Components can subscribe to this signal to update
   * their visual state when the selection changes.
   */
  readonly selected = this._selected.asReadonly();

  /**
   * Anchor slot used as the starting point for range selections (Shift + click).
   */
  private anchorId = signal<string | null>(null);

  /**
   * The most recently interacted slot.
   * Useful for keyboard navigation or future selection features.
   */
  private focusId = signal<string | null>(null);

  /**
   * Updates the slot selection according to the user interaction.
   *
   * Behavior depends on keyboard modifiers:
   *
   * - **Click** → select a single slot
   * - **Ctrl/Cmd + Click** → toggle slot in the selection
   * - **Shift + Click** → select a range between the anchor and the clicked slot
   *
   * @param id - The ID of the slot being interacted with.
   * @param orderedIds - List of slot IDs in timeline order. Required to compute
   *                     the range selection.
   * @param event - Pointer event used to detect modifier keys.
   */
  select(
    id: string,
    orderedIds: string[],
    event: PointerEvent
  ): void {

    const next = new Set(this._selected());

    const isMulti = event.metaKey || event.ctrlKey;
    const isRange = event.shiftKey;

    if (isRange && this.anchorId()) {
      this.applyRangeSelection(next, id, orderedIds);
    }

    else if (isMulti) {
      this.toggleSelection(next, id);
      this.anchorId.set(id);
    }

    else {
      next.clear();
      next.add(id);
      this.anchorId.set(id);
    }

    this.focusId.set(id);
    this._selected.set(next);
  }

  /**
   * Clears the entire selection and resets internal selection references.
   */
  clear() {
    this._selected.set(new Set());
    this.anchorId.set(null);
    this.focusId.set(null);
  }

  /**
   * Checks whether a slot is currently selected.
   *
   * @param id - Slot ID to check.
   * @returns `true` if the slot is selected.
   */
  isSelected(id: string) {
    return this._selected().has(id);
  }

  /**
   * Returns the list of selected slot IDs.
   * Useful for batch operations such as delete, duplicate or multi-drag.
   */
  getSelectedIds() {
    return Array.from(this._selected());
  }

  /**
   * Toggles the presence of a slot in the selection.
   *
   * @param set - The mutable selection set.
   * @param id - Slot ID to toggle.
   */
  private toggleSelection(set: Set<string>, id: string) {

    if (set.has(id)) {
      set.delete(id);
    } else {
      set.add(id);
    }

  }

  /**
   * Applies a range selection between the anchor slot and the target slot.
   *
   * The method determines the indices of the anchor and target within the
   * ordered slot list and selects all slots between them (inclusive).
   *
   * @param set - The mutable selection set.
   * @param id - Target slot ID.
   * @param orderedIds - Ordered list of slot IDs representing the timeline.
   */
  private applyRangeSelection(
    set: Set<string>,
    id: string,
    orderedIds: string[]
  ) {

    const anchor = this.anchorId();
    if (!anchor) return;

    const anchorIndex = orderedIds.indexOf(anchor);
    const targetIndex = orderedIds.indexOf(id);

    if (anchorIndex === -1 || targetIndex === -1) return;

    const [start, end] =
      anchorIndex < targetIndex
        ? [anchorIndex, targetIndex]
        : [targetIndex, anchorIndex];

    set.clear();

    for (let i = start; i <= end; i++) {
      set.add(orderedIds[i]);
    }

  }

}
