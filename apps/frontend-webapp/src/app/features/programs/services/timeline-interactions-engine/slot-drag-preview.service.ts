import { Injectable } from '@angular/core';
import type { TSlotDragInteraction } from './slot-drag-interaction.service';


/**
 * Computes the preview state for slot drag interactions.
 *
 * ---------------------------------------------------------------------------
 * 🧠 ROLE IN ARCHITECTURE
 * ---------------------------------------------------------------------------
 *
 * Part of the **Interaction Engine layer**.
 *
 * This service is responsible for transforming:
 *
 * - A validated interaction context (drag state)
 * - A spatial projection (pointer → timeline)
 *
 * into:
 *
 * - A set of preview positions for slots
 *
 * It acts as the **core computation layer** for drag rendering,
 * without mutating the main program state.
 *
 * ---------------------------------------------------------------------------
 * ⚡ RESPONSIBILITIES
 * ---------------------------------------------------------------------------
 *
 * - Compute temporary slot positions during drag
 * - Apply offsets for multi-slot drag
 * - Provide data for the interaction store (preview layer)
 *
 * ---------------------------------------------------------------------------
 * 📦 INPUTS
 * ---------------------------------------------------------------------------
 *
 * - `interaction` → drag interaction data:
 *    - slot IDs
 *    - relative offsets (multi-drag support)
 *
 * - `projection` → spatial projection:
 *    - `minutes` → target timeline position
 *    - `room_id` → target room
 *
 * ---------------------------------------------------------------------------
 * 📦 OUTPUT
 * ---------------------------------------------------------------------------
 *
 * Returns an array of preview objects:
 *
 * - `slotId` → target slot
 * - `previewStart` → computed start time (minutes)
 * - `previewRoomId` → target room
 *
 * These values are consumed by {@link TimelineInteractionStore}
 * to render the live drag preview.
 *
 * ---------------------------------------------------------------------------
 * 🎯 USAGE
 * ---------------------------------------------------------------------------
 *
 * ```ts
 * const updates = previewService.computePreview(interaction, projection);
 * store.update(updates);
 * ```
 *
 * Used by:
 * - SlotDragInteractionService
 *
 * ---------------------------------------------------------------------------
 * ⚠️ IMPORTANT
 * ---------------------------------------------------------------------------
 *
 * - This service does NOT:
 *   - mutate the program state
 *   - apply constraints (collision, snapping, etc.)
 *
 * - It only performs **raw positional computation**
 *
 * - Constraints should be applied in a dedicated layer
 *   (e.g. ConstraintEngineService)
 *
 * ---------------------------------------------------------------------------
 * 💡 DESIGN NOTES
 * ---------------------------------------------------------------------------
 *
 * - Pure and deterministic (same input → same output)
 * - No side effects
 * - Fully testable in isolation
 *
 * ---------------------------------------------------------------------------
 * 🚀 EXTENSIONS
 * ---------------------------------------------------------------------------
 *
 * This service can evolve to:
 *
 * - integrate gap-based positioning
 * - support snapping / magnetic behavior
 * - apply constraint engines (strict, ripple, etc.)
 *
 */
@Injectable({ providedIn: 'root' })
export class SlotDragPreviewService {

  /**
   * Computes preview positions for dragged slots.
   *
   * @param interaction - Current drag interaction state
   * @param projection - Spatial projection of the pointer
   *
   * @returns Array of preview slot updates
   */
  computePreview(
    interaction: TSlotDragInteraction,
    projection: { minutes: number; room_id: string }
  ) {

    return interaction.slots.map(s => ({
      slotId: s.slotId,
      previewStart: projection.minutes + s.offsetMinutes,
      previewRoomId: projection.room_id
    }));
  }
}
