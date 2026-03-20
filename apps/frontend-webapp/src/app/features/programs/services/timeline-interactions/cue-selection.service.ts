import { Injectable, signal } from '@angular/core';


/**
 * Manages selection state for timeline cues.
 *
 * ---------------------------------------------------------------------------
 * 🧠 ROLE
 * ---------------------------------------------------------------------------
 *
 * Stores ONLY cue IDs (source of truth).
 *
 * Objects are derived via selectors (CueSelectorsService).
 *
 * ---------------------------------------------------------------------------
 * ⚠️ IMPORTANT
 * ---------------------------------------------------------------------------
 *
 * - Never store full cue objects (avoid stale references)
 * - Always store IDs
 *
 */
@Injectable({ providedIn: 'root' })
export class CueSelectionService {

  private _selectedIds = signal<string[]>([]);

  /** Read-only selected cue IDs */
  selectedIds = this._selectedIds.asReadonly();

  /* ---------------- SELECT ---------------- */

  selectSingle(id: string) {
    this._selectedIds.set([id]);
  }

  toggle(id: string) {
    const current = this._selectedIds();

    if (current.includes(id)) {
      this._selectedIds.set(current.filter(i => i !== id));
    } else {
      this._selectedIds.set([...current, id]);
    }
  }

  selectMultiple(ids: string[]) {
    this._selectedIds.set(ids);
  }

  clear() {
    this._selectedIds.set([]);
  }

  /* ---------------- HELPERS ---------------- */

  isSelected(id: string): boolean {
    return this._selectedIds().includes(id);
  }

  getSelectedIds(): string[] {
    return this._selectedIds();
  }
}
