import { Injectable, signal } from '@angular/core';
import type { DragState } from './drag.types';

//TODO : rendre générique DragSessionService<T>
@Injectable({ providedIn: 'root' })
export class DragSessionService {

  private _current = signal<DragState | null>(null);
  readonly current = this._current.asReadonly();

  cursorX = signal(0);
  cursorY = signal(0);

  /* ---------------- START ---------------- */

  start(drag: DragState) {
    // 🔒 guard
    if (this._current()) {
      return;
    }

    this._current.set(drag);
  }

  /* ---------------- STOP ---------------- */
  /**
   * Stop the current drag session, if any.
   * This will reset the current drag state to null, indicating that no drag operation is active.
    * It is important to call this method when a drag operation is completed or cancelled to ensure that the application state remains consistent and to allow new drag operations to be initiated.
   * @returns void
   */
  stop() {
    this._current.set(null);
  };

  /* ---------------- HELPERS ---------------- */

  isDragging(): boolean {
    return this._current() !== null;
  };

  isType<T extends DragState['type']>(
    type: T
  ): this is { current: () => Extract<DragState, { type: T }> } {
    return this._current()?.type === type;
  };


  updatePointer(event: PointerEvent) {
    this.cursorX.set(event.clientX);
    this.cursorY.set(event.clientY);
  };


  /**
   * for uiDndDrop directive
   * @private
   */
  private _dropTarget = signal<string | null>(null);
  dropTarget = this._dropTarget.asReadonly();

  setDropTarget(id: string) {
    this._dropTarget.set(id);
  }

  clearDropTarget() {
    this._dropTarget.set(null);
  }
}


