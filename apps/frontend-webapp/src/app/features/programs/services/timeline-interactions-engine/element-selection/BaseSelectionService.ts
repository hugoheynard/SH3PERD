import { Injectable, signal } from '@angular/core';

/**
 * Generic selection service used to manage the selection state of entities
 * identified by a unique ID.
 *
 * ---------------------------------------------------------------------------
 * 🧠 ROLE IN ARCHITECTURE
 * ---------------------------------------------------------------------------
 *
 * This service provides a reusable, type-safe foundation for selection logic
 * across the application (slots, cues, etc.).
 *
 * It encapsulates all common selection behaviors:
 *
 * - Single selection
 * - Multi-selection (Ctrl / Cmd)
 * - Range selection (Shift)
 *
 * Concrete selection services (e.g. SlotSelectionService, CueSelectionService)
 * extend this base class to inherit consistent behavior without duplication.
 *
 * ---------------------------------------------------------------------------
 * ⚡ FEATURES
 * ---------------------------------------------------------------------------
 *
 * - Uses a `Set<TId>` for efficient lookup and uniqueness
 * - Fully reactive via Angular signals
 * - Supports professional editor patterns (Figma / DAW-like UX)
 *
 * Internal concepts:
 *
 * - **anchorId** → reference point for range selections
 * - **focusId** → last interacted item
 *
 * ---------------------------------------------------------------------------
 * 📦 STATE MODEL
 * ---------------------------------------------------------------------------
 *
 * Internal signals:
 *
 * - `_selected` → Set of selected IDs
 * - `anchorId` → range selection start
 * - `focusId` → last interacted item
 *
 * Public API:
 *
 * - `selected` → readonly signal of selected IDs
 * - `select()` → main selection entry point
 * - `clear()` → reset selection
 * - `isSelected()` → check membership
 * - `getSelectedIds()` → retrieve selected IDs
 *
 * ---------------------------------------------------------------------------
 * 🎯 USAGE
 * ---------------------------------------------------------------------------
 *
 * Extend this class to create a domain-specific selection service:
 *
 * ```ts
 * @Injectable({ providedIn: 'root' })
 * export class SlotSelectionService extends BaseSelectionService<string> {}
 * ```
 *
 * ```ts
 * @Injectable({ providedIn: 'root' })
 * export class CueSelectionService extends BaseSelectionService<string> {}
 * ```
 *
 * ---------------------------------------------------------------------------
 * ⚠️ IMPORTANT
 * ---------------------------------------------------------------------------
 *
 * - This service stores ONLY IDs, never full objects
 * - Consumers must resolve entities via selectors (e.g. `slotsById`)
 * - This ensures consistency with the global state and avoids stale references
 *
 * ---------------------------------------------------------------------------
 * 🚀 EXTENSIONS
 * ---------------------------------------------------------------------------
 *
 * This base service can be extended to support:
 *
 * - Select all / invert selection
 * - Keyboard navigation
 * - Multi-entity selection systems
 * - Drag-aware selection behavior
 *
 */
@Injectable()
export class BaseSelectionService<TId> {

  /**
   * Internal reactive state storing selected slot IDs.
   */
  protected _selected = signal<Set<TId>>(new Set());

  /**
   * Read-only signal exposing the current selection.
   * Components can subscribe to this signal to update
   * their visual state when the selection changes.
   */
  readonly selected = this._selected.asReadonly();

  /**
   * Anchor slot used as the starting point for range selections (Shift + click).
   */
  protected anchorId = signal<TId | null>(null);

  /**
   * The most recently interacted slot.
   * Useful for keyboard navigation or future selection features.
   */
  protected focusId = signal<TId | null>(null);

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
    id: TId,
    orderedIds: TId[],
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
  isSelected(id: TId) {
    return this._selected().has(id);
  }

  /**
   * Returns the list of selected slot IDs.
   * Useful for batch operations such as delete, duplicate or multi-drag.
   */
  getSelectedIds(): TId[] {
    return Array.from(this._selected());
  }

  /**
   * Toggles the presence of a slot in the selection.
   *
   * @param set - The mutable selection set.
   * @param id - Slot ID to toggle.
   */
  protected toggleSelection(set: Set<TId>, id: TId) {
    if (set.has(id)) set.delete(id);
    else set.add(id);
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
  protected applyRangeSelection(
    set: Set<TId>,
    id: TId,
    orderedIds: TId[]
  ) {
    const anchor = this.anchorId();
    if (!anchor) {
      return;
    }

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


  handlePointerDown(
    id: TId,
    orderedIds: TId[],
    event: PointerEvent
  ) {

    const isMulti = event.metaKey || event.ctrlKey;
    const isRange = event.shiftKey;
    const alreadySelected = this.isSelected(id);

    // 👉 click simple sur un élément déjà sélectionné
    if (!isMulti && !isRange && alreadySelected) {
      return;
    }

    this.select(id, orderedIds, event);
  }
}
