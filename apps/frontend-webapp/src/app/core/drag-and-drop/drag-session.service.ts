import { computed, Injectable, signal } from '@angular/core';
import type { DragState } from './drag.types';


/**
 * Manages the lifecycle and state of an active drag session.
 *
 * ---------------------------------------------------------------------------
 * 🧠 ROLE IN ARCHITECTURE
 * ---------------------------------------------------------------------------
 *
 * This service is part of the **Drag & Drop Core Interaction Layer**.
 *
 * It acts as the **single source of truth** for the current drag operation,
 * including:
 *
 * - The dragged payload (DragState)
 * - The current cursor position
 * - The active drop target (if any)
 *
 * It is consumed by multiple systems:
 *
 * - Drop zone detection
 * - Drag preview rendering
 * - Timeline interaction engines
 *
 * ---------------------------------------------------------------------------
 * ⚡ RESPONSIBILITIES
 * ---------------------------------------------------------------------------
 *
 * - Start and stop drag sessions
 * - Store the current drag payload
 * - Track pointer (cursor) position in real time
 * - Expose reactive signals for UI updates
 * - Manage the currently hovered drop target
 *
 * ---------------------------------------------------------------------------
 * 🧩 DRAG STATE
 * ---------------------------------------------------------------------------
 *
 * The current drag is stored as a {@link DragState}, which is a discriminated
 * union representing all possible draggable entities in the system.
 *
 * - `current()` → readonly signal of the active drag
 * - `null` → no active drag session
 *
 * ---------------------------------------------------------------------------
 * 🖱️ POINTER TRACKING
 * ---------------------------------------------------------------------------
 *
 * Cursor position is tracked using a signal:
 *
 * - `cursor` → raw `{ x, y }`
 * - `cursorX`, `cursorY` → derived computed signals
 *
 * This allows:
 *
 * - Drag previews to follow the pointer
 * - Spatial systems (drop zones, snapping) to react in real time
 *
 * ---------------------------------------------------------------------------
 * 🎯 DROP TARGET MANAGEMENT
 * ---------------------------------------------------------------------------
 *
 * The service stores the current drop target identifier during a drag session.
 *
 * This is typically set by the {@link DropZoneRegistryService} when a valid
 * drop zone is detected under the cursor.
 *
 * - `setDropTarget()` → sets current target
 * - `getDropTarget()` → retrieves current target
 * - `clearDropTarget()` → resets target
 *
 * ---------------------------------------------------------------------------
 * 🔁 LIFECYCLE
 * ---------------------------------------------------------------------------
 *
 * A drag session follows this lifecycle:
 *
 * 1. `start(drag)` → initializes a new session
 * 2. `updatePointer(event)` → updates cursor position
 * 3. Drop zone detection updates target (optional)
 * 4. `stop()` → ends the session
 *
 * Starting a new drag automatically cancels any existing session.
 *
 * ---------------------------------------------------------------------------
 * 🧠 DESIGN PRINCIPLES
 * ---------------------------------------------------------------------------
 *
 * - Centralized state (single source of truth)
 * - Reactive via Angular signals
 * - Framework-agnostic logic (no UI coupling)
 * - Lightweight and synchronous (no async complexity)
 *
 * ---------------------------------------------------------------------------
 * ⚠️ NOTES
 * ---------------------------------------------------------------------------
 *
 * - This service does NOT handle drop logic itself
 * - It does NOT mutate domain data
 * - It only manages interaction state
 *
 * ---------------------------------------------------------------------------
 * 🚀 EXTENSIONS
 * ---------------------------------------------------------------------------
 *
 * This service can evolve to support:
 *
 * - Multi-pointer / multi-drag sessions
 * - Drag constraints (axis lock, boundaries)
 * - Velocity / inertia tracking
 * - Snap-to-grid integration
 *
 * ---------------------------------------------------------------------------
 * 💡 TODO
 * ---------------------------------------------------------------------------
 *
 * The service can be made generic:
 *
 * ```ts
 * DragSessionService<TDragState>
 * ```
 *
 * to support multiple independent drag systems with stronger typing.
 *
 */
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


