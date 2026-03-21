import { Injectable } from '@angular/core';
import { BaseSelectionService } from './BaseSelectionService';


/**
 * Manages the selection state of performance slots within the planner timeline.
 *
 * ---------------------------------------------------------------------------
 * 🧠 ROLE IN ARCHITECTURE
 * ---------------------------------------------------------------------------
 *
 * Concrete implementation of {@link BaseSelectionService} for slot entities.
 *
 * This service specializes the generic selection logic for slots by defining
 * the identifier type (`string`) and exposing a ready-to-use selection state
 * for all slot-related interactions.
 *
 * ---------------------------------------------------------------------------
 * ⚡ RESPONSIBILITIES
 * ---------------------------------------------------------------------------
 *
 * - Handle slot selection (single, multi, range)
 * - Provide reactive access to selected slot IDs
 * - Act as the single source of truth for slot selection state
 *
 * All core selection behaviors are inherited from the base service.
 *
 * ---------------------------------------------------------------------------
 * 🎯 USAGE
 * ---------------------------------------------------------------------------
 *
 * Used by:
 *
 * - Timeline components (slot click / drag interactions)
 * - Keyboard shortcuts (delete, duplicate, etc.)
 * - Interaction systems (multi-drag, batch operations)
 *
 * Selected slot entities should be resolved via selectors:
 *
 * ```ts
 * const selectedSlots = slotSelectors.selectedSlots();
 * ```
 *
 * ---------------------------------------------------------------------------
 * ⚠️ IMPORTANT
 * ---------------------------------------------------------------------------
 *
 * - This service stores ONLY slot IDs (not slot objects)
 * - Always combine with selectors (`slotsById`) to retrieve full data
 *
 */
@Injectable({ providedIn: 'root' })
export class SlotSelectionService
  extends BaseSelectionService<string> {}
