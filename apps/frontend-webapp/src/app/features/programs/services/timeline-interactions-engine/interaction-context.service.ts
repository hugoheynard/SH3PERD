import { inject, Injectable } from '@angular/core';
import { TimelineSpatialService } from '../timeline-spatial.service';
import type { InteractionContext, InteractionProjection } from './interaction-context.types';



/**
 * Provides a unified way to build a valid interaction context
 * from a raw interaction state (drag, resize, insert, etc.).
 *
 * ---------------------------------------------------------------------------
 * 🧠 ROLE IN ARCHITECTURE
 * ---------------------------------------------------------------------------
 *
 * Part of the **Interaction Engine layer**.
 *
 * This service acts as a **guard + adapter** between:
 *
 * - Raw interaction state (pointer-driven)
 * - Spatial projection (timeline coordinates)
 *
 * It centralizes all logic required to safely derive a usable
 * interaction context for downstream systems (preview, constraints, UI).
 *
 * ---------------------------------------------------------------------------
 * ⚡ RESPONSIBILITIES
 * ---------------------------------------------------------------------------
 *
 * - Validate that an interaction is active
 * - Convert pointer position → timeline projection
 * - Return a safe, typed interaction context
 *
 * ---------------------------------------------------------------------------
 * 📦 OUTPUT
 * ---------------------------------------------------------------------------
 *
 * Returns an {@link InteractionContext} containing:
 *
 * - `interaction` → the original interaction object
 * - `projection` → computed spatial projection:
 *    - `minutes` → snapped timeline position
 *    - `room_id` → target room
 *    - `px` → pixel position
 *
 * Returns `null` if:
 * - no interaction is active
 * - pointer is outside any valid room
 *
 * ---------------------------------------------------------------------------
 * 🎯 USAGE
 * ---------------------------------------------------------------------------
 *
 * ```ts
 * const ctx = interactionContextService.getContext(interaction);
 * if (!ctx) return;
 *
 * const { interaction, projection } = ctx;
 * ```
 *
 * Used by:
 * - SlotDragInteractionService
 * - SlotResizeInteractionService
 * - Insert interaction system
 *
 * ---------------------------------------------------------------------------
 * 💡 DESIGN NOTES
 * ---------------------------------------------------------------------------
 *
 * - Pure computation (no side effects)
 * - Centralizes pointer → timeline conversion
 * - Avoids duplication of guard logic across interaction services
 *
 * ---------------------------------------------------------------------------
 * 🚀 EXTENSIONS
 * ---------------------------------------------------------------------------
 *
 * This service can be extended to include:
 *
 * - snapping data
 * - bounds constraints
 * - zoom / scale context
 * - collision pre-checks
 *
 */
@Injectable({ providedIn: 'root' })
export class InteractionContextService {

  private spatial = inject(TimelineSpatialService);

  /**
   * Builds a safe interaction context from a given interaction state.
   *
   * @typeParam T - Interaction type (must include `grabOffset`)
   *
   * @param interaction - Current interaction state (or null)
   *
   * @returns A valid {@link InteractionContext} or `null` if invalid
   */
  getContext<T extends { grabOffset: number }>(
    interaction: T | null
  ): InteractionContext<T> | null {

    if (!interaction) {
      return null;
    }

    const projection: InteractionProjection | null =
      this.spatial.projectPointer(interaction.grabOffset);

    if (!projection) {
      return null;
    }

    return {
      interaction,
      projection
    };
  }
}
