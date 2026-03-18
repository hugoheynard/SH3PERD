import { inject, Injectable } from '@angular/core';
import { DragSessionService } from '../../../core/drag-and-drop/drag-session.service';
import { RoomLayoutRegistry } from './room-layout-registry.service';
import { PlannerResolutionService } from './planner-resolution.service';


/**
 * Centralized spatial computation service for the planner timeline.
 *
 * This service is responsible for converting **pointer coordinates**
 * into **timeline coordinates (room + time)**.
 *
 * It acts as the single source of truth for all spatial calculations,
 * replacing duplicated logic across components and services.
 *
 * ---------------------------------------------------------------------------
 * 🧠 ROLE IN ARCHITECTURE
 * ---------------------------------------------------------------------------
 *
 * Part of the "Spatial Engine" layer.
 *
 * Bridges:
 *
 * - Pointer input (DragSessionService)
 * - DOM layout (RoomLayoutRegistry)
 * - Timeline resolution (PlannerResolutionService)
 *
 * ---------------------------------------------------------------------------
 * ⚡ WHAT IT DOES
 * ---------------------------------------------------------------------------
 *
 * Given the current pointer position, it computes:
 *
 * - The **target room** (based on X axis)
 * - The **timeline position** (based on Y axis)
 * - A **corrected position** using a grab offset (anchor)
 *
 * This ensures:
 *
 * - Stable drag (no jump)
 * - Consistent insert line
 * - No duplication of spatial logic
 *
 * ---------------------------------------------------------------------------
 * 🎯 COORDINATE SYSTEM
 * ---------------------------------------------------------------------------
 *
 * X axis → determines the room (column)
 * Y axis → determines the time (vertical timeline)
 *
 * ---------------------------------------------------------------------------
 * 📦 OUTPUT
 * ---------------------------------------------------------------------------
 *
 * Returns a projection object:
 *
 * - roomId → target room
 * - minutes → snapped timeline position
 * - correctedY → pixel position of the slot (after anchor correction)
 *
 * Returns `null` if no valid room is found.
 *
 * ---------------------------------------------------------------------------
 * ⚠️ IMPORTANT
 * ---------------------------------------------------------------------------
 *
 * - This service is PURE (no side effects)
 * - It should be the ONLY place performing spatial calculations
 * - Consumers must not recompute rect / offsets manually
 *
 * ---------------------------------------------------------------------------
 * 🚀 EXTENSIONS
 * ---------------------------------------------------------------------------
 *
 * This service is the ideal place to add:
 *
 * - Magnetic snapping
 * - Collision resolution
 * - Zoom-aware positioning
 * - Multi-room projection
 *
 */
@Injectable({ providedIn: 'root' })
export class TimelineSpatialService {

  private drag = inject(DragSessionService);
  private layout = inject(RoomLayoutRegistry);
  private res = inject(PlannerResolutionService);

  /**
   * Projects the current pointer position into timeline coordinates.
   *
   * @param grabOffset - Distance between pointer and slot top at drag start.
   * Ensures stable dragging regardless of where the user clicked.
   *
   * @returns Projection object or null if no room is detected.
   */
  projectPointer(grabOffset = 0) {

    const x = this.drag.cursorX();
    const y = this.drag.cursorY();

    const room_id = this.layout.getRoomAt(x);

    if (!room_id) {
      return null;
    }

    const rect = this.layout.getRect(room_id);

    if (!rect) {
      return null;
    }

    const relativeY = y - rect.top;
    const correctedY = relativeY - grabOffset;

    const rawMinutes = this.res.pxToMinutes(correctedY);
    const snappedMinutes = this.res.snap(rawMinutes);

    const clamped = Math.max(0, snappedMinutes);

    return {
      room_id: room_id,
      minutes: clamped,
      px: this.res.minuteToPx(clamped)
    };
  }
}
