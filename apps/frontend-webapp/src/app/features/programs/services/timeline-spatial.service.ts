import { inject, Injectable } from '@angular/core';
import { DragSessionService } from '../../../core/drag-and-drop/drag-session.service';
import { RoomLayoutRegistry } from './room-layout-registry.service';
import { PlannerResolutionService } from './planner-resolution.service';
import type { InteractionProjection } from './timeline-interactions-engine/interaction-context.types';
import { TIMELINE_PROJECTOR } from './timelineProjectionSystem/TimelineProjector';


/**
 * Centralized spatial computation service for the planner timeline.
 *
 * This service converts **pointer coordinates** into **timeline coordinates**
 * (room + time) and acts as the single source of truth for all spatial logic.
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
 * - The **target room** (X axis)
 * - The **timeline position in minutes** (Y axis)
 * - A **stable corrected position** using a grab offset
 *
 * The conversion pipeline is:
 *
 *   px → minutes → snap → px
 *
 * This ensures:
 *
 * - Stable drag (no jump)
 * - Consistent snapping
 * - Perfect alignment with the timeline grid
 *
 * ---------------------------------------------------------------------------
 * 📦 OUTPUT
 * ---------------------------------------------------------------------------
 *
 * Returns a projection object:
 *
 * - `roomId` → target room
 * - `minutes` → snapped timeline position (clamped ≥ 0)
 * - `px` → snapped pixel position
 *
 * Returns `null` if no valid room is found.
 *
 * ---------------------------------------------------------------------------
 * ⚠️ IMPORTANT
 * ---------------------------------------------------------------------------
 *
 * - This service is PURE (no side effects)
 * - Must be the ONLY place performing spatial calculations
 * - Consumers must NOT recompute rects or offsets manually
 * - Values are clamped to prevent negative timeline positions
 *
 * ---------------------------------------------------------------------------
 * 🚀 EXTENSIONS
 * ---------------------------------------------------------------------------
 *
 * Ideal place to implement:
 *
 * - Magnetic snapping
 * - Collision resolution
 * - Zoom-aware positioning
 * - Multi-room projection
 */
@Injectable({ providedIn: 'root' })
export class TimelineSpatialService {

  private drag = inject(DragSessionService);
  private layout = inject(RoomLayoutRegistry);
  private res = inject(PlannerResolutionService);
  private projector = inject(TIMELINE_PROJECTOR);

  /**
   * Projects the current pointer position into timeline coordinates.
   *
   * @param grabOffset Distance between pointer and slot top at drag start.
   * Ensures stable dragging regardless of click position.
   *
   * @returns Projection object or null if no room is detected.
   */
  projectPointer(grabOffset = 0): InteractionProjection | null {

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

    const timelineMinutes = this.projector.unproject(snappedMinutes, room_id);

    const clamped = Math.max(0, timelineMinutes);

    return {
      room_id: room_id,
      minutes: clamped,
      px: this.res.minuteToPx(
        this.projector.project(clamped, room_id)
      )
    };
  }
}
