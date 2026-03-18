import { computed, inject, Injectable, signal } from '@angular/core';
import { TimelineSpatialService } from './timeline-spatial.service';
import { DragSessionService } from '../../../core/drag-and-drop/drag-session.service';

/**
 * Manages the ephemeral interaction state for timeline drag operations.
 *
 * This store represents the **"interaction layer"** of the planner architecture,
 * sitting between the persistent program state and the UI rendering layer.
 *
 * It is responsible for:
 *
 * - Holding temporary slot positions during a drag operation
 * - Providing real-time preview values without mutating the main state
 * - Enabling smooth UI updates (no state writes during pointer move)
 * - Supporting advanced interactions like multi-drag and ghost previews
 *
 * ---------------------------------------------------------------------------
 * 🧠 ARCHITECTURE ROLE
 * ---------------------------------------------------------------------------
 *
 * This service is part of a 3-layer architecture:
 *
 * 1. **Program State (source of truth)**
 *    → Stored in ProgramStateService
 *
 * 2. **Interaction State (this store)**
 *    → Temporary, only exists during user interaction (drag/resize)
 *
 * 3. **Render Layer**
 *    → Combines state + interaction for UI projection
 *
 * This separation is essential for building high-performance editors
 * similar to Figma, Ableton, or Notion.
 *
 * ---------------------------------------------------------------------------
 * ⚡ LIFECYCLE
 * ---------------------------------------------------------------------------
 *
 * A typical drag operation follows this lifecycle:
 *
 * 1. `start()` → initialize preview positions
 * 2. `update()` → update preview positions on pointer move
 * 3. `stop()` → clear interaction state after commit
 *
 * ⚠️ Important:
 * This store NEVER mutates the main program state.
 * The final values must be committed separately (usually on drop).
 *
 * ---------------------------------------------------------------------------
 * 💡 DESIGN NOTES
 * ---------------------------------------------------------------------------
 *
 * - Uses Angular signals for fine-grained reactivity
 * - Stores only minimal data needed for rendering (slotId + previewStart)
 * - Supports multi-slot drag out of the box
 * - Designed to be easily extended (resize, ghost layers, etc.)
 *
 * ---------------------------------------------------------------------------
 * 🚀 EXTENSIONS (future)
 * ---------------------------------------------------------------------------
 *
 * This store can be extended to support:
 *
 * - Ghost preview layers (floating elements)
 * - Drag velocity / inertia
 * - Cross-room dragging
 * - Magnetic snapping
 * - Collision systems
 *
 */
@Injectable({ providedIn: 'root' })
export class TimelineInteractionStore {
  private spatial = inject(TimelineSpatialService);
  private drag = inject(DragSessionService);


  /**
   * Internal signal holding the current drag preview state.
   *
   * Each entry represents a slot being dragged with its temporary position.
   *
   * - `slotId` → unique identifier of the slot
   * - `previewStart` → temporary start time in minutes
   *
   * When `null`, no drag interaction is active.
   */
  private _draggingSlots = signal<{
    slotId: string;
    previewStart: number;
    previewRoomId: string | null;
  }[] | null>(null);

  /**
   * Read-only signal exposing the current drag preview state.
   *
   * Components and selectors should subscribe to this signal
   * to render live drag previews without mutating the main state.
   */
  readonly draggingSlots = this._draggingSlots.asReadonly();

  /**
   *
   */
  hoveredRoomId = computed(() => {

    if (!this.drag.isDragging()) {
      return null;
    }

    const projection = this.spatial.projectPointer();
    return projection?.room_id ?? null;
  });

  /**
   * Initializes a drag interaction.
   *
   * Called when a drag starts (pointer down → drag threshold passed).
   *
   * @param slots - List of slots involved in the drag operation.
   * Each slot contains:
   * - `slotId` → unique identifier
   * - `base` → original start time (in minutes)
   *
   * These values are used as the initial preview state.
   */
  start(slots: { slotId: string; base: number; roomId: string }[]) {
    this._draggingSlots.set(
      slots.map(s => ({
        slotId: s.slotId,
        previewStart: s.base,
        previewRoomId: s.roomId
      }))
    );
  }

  /**
   * Updates the preview positions of dragged slots.
   *
   * Called on every pointer move during a drag interaction.
   *
   * @param slots - Updated preview positions for each dragged slot.
   * Each entry contains:
   * - `slotId` → unique identifier
   * - `previewStart` → new temporary start time (in minutes)
   *
   * This method replaces the entire preview state to ensure consistency
   * and avoid incremental drift errors.
   */
  update(slots: { slotId: string; previewStart: number, previewRoomId: string | null }[]) {
    this._draggingSlots.set(slots);
  }

  /**
   * Clears the current drag interaction state.
   *
   * Called when the drag ends (pointer up / cancel).
   *
   * ⚠️ This does NOT commit changes to the main state.
   * Commit must be handled separately (e.g. in TimelineInteractionService).
   */
  stop() {
    this._draggingSlots.set(null);
  }
}
