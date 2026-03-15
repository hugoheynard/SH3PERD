import { computed, Injectable, signal } from '@angular/core';
import type { DragState } from './drag.types';

//TODO : rendre générique DragSessionService<T>
@Injectable({ providedIn: 'root' })
export class DragSessionService {

  private _current = signal<DragState | null>(null);
  readonly current = this._current.asReadonly();

  cursor = signal({ x:0, y:0 });

  readonly cursorX = computed(() => this.cursor().x);
  readonly cursorY = computed(() => this.cursor().y);

  /* ---------------- START ---------------- */

  start(drag: DragState) {
    if (this._current()) {
      this.stop();
    }

    this._current.set(drag);
    this.clearDropTarget();
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


  updatePointer(event: PointerEvent) {
    this.cursor.set({
      x: event.clientX,
      y: event.clientY
    });
  }


  /**
   * for uiDndDrop directive
   * @private
   */
  private _dropTarget = signal<unknown | null>(null);

  setDropTarget<T>(target_id: T) {
    this._dropTarget.set(target_id);
    console.log(this.getDropTarget());
  };

  /**
   *
   */
  getDropTarget<T>() {
    return this._dropTarget() as T | null;
  };

  clearDropTarget() {
    this._dropTarget.set(null);
  }
}


