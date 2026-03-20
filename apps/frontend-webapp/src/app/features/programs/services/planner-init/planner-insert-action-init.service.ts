import { inject, Injectable } from '@angular/core';
import { InsertActionRegistry } from '../../insert-interaction-system/actions-services/insert-action-registry.service';
import { CueService } from '../mutations-layer/cue.service';
import { SlotService } from '../mutations-layer/slot.service';

/**
 * Initializes and registers all insert actions for the planner.
 *
 * ---------------------------------------------------------------------------
 * 🧠 ROLE IN ARCHITECTURE
 * ---------------------------------------------------------------------------
 *
 * Part of the **Insert Interaction System bootstrap layer**.
 *
 * This service is responsible for **wiring together**:
 *
 * - The **InsertActionRegistry** (interaction layer)
 * - The **domain services** (CueService, SlotService, etc.)
 *
 * It defines how each insert action (e.g. 'cue', 'slot') is translated into
 * a concrete mutation of the program state.
 *
 * ---------------------------------------------------------------------------
 * 🔄 ARCHITECTURE FLOW
 * ---------------------------------------------------------------------------
 *
 * ```
 * UI (Radial Menu)
 *        │
 *        ▼
 * InsertActionService (dispatcher)
 *        │
 *        ▼
 * InsertActionRegistry
 *        │
 *        ▼
 * PlannerInsertActionsInitService (this)
 *        │
 *        ▼
 * Domain Services (CueService, SlotService...)
 * ```
 *
 * ---------------------------------------------------------------------------
 * ⚡ RESPONSIBILITIES
 * ---------------------------------------------------------------------------
 *
 * - Register all supported insert actions at application startup
 * - Map user intent (InsertActionType) to domain mutations
 * - Keep UI completely decoupled from business logic
 *
 * ---------------------------------------------------------------------------
 * 🎯 DESIGN PRINCIPLES
 * ---------------------------------------------------------------------------
 *
 * - Centralized registration (single source of truth)
 * - No logic in UI components
 * - No switch/case branching
 * - Fully extensible via registry pattern
 *
 * ---------------------------------------------------------------------------
 * ⚠️ IMPORTANT
 * ---------------------------------------------------------------------------
 *
 * - This service MUST be instantiated at least once
 *   (typically via `inject(...)` in a root component)
 *   to ensure actions are registered.
 *
 * - Each action should be registered exactly once.
 *
 * ---------------------------------------------------------------------------
 * 💡 USAGE
 * ---------------------------------------------------------------------------
 *
 * This service is automatically executed on instantiation:
 *
 * ```ts
 * constructor() {
 *   this.registerActions();
 * }
 * ```
 *
 * No manual calls are required.
 *
 * ---------------------------------------------------------------------------
 * 🚀 EXTENSIONS
 * ---------------------------------------------------------------------------
 *
 * New insert actions can be added by:
 *
 * 1. Extending `InsertActionType`
 * 2. Registering a new handler here
 *
 * Example:
 *
 * ```ts
 * this.registry.register('my-action', ctx => {
 *   myService.doSomething(ctx);
 * });
 * ```
 *
 * ---------------------------------------------------------------------------
 * 🔮 FUTURE IMPROVEMENTS
 * ---------------------------------------------------------------------------
 *
 * This layer can evolve to support:
 *
 * - Undo/redo transaction grouping
 * - Permission-based actions
 * - Feature flags
 * - Analytics / telemetry on user actions
 *
 */
@Injectable({ providedIn: 'root' })
export class PlannerInsertActionsInitService {

  private registry = inject(InsertActionRegistry);
  private cueService = inject(CueService);
  private slotService = inject(SlotService);

  constructor() {
    this.registerActions();
  }

  /**
   * Registers all insert actions available in the planner.
   *
   * Each action maps a user intent (type) to a domain operation.
   */
  private registerActions() {

    /* ---------------- CUE ---------------- */

    /**
     * Inserts a timeline cue at the given position.
     */
    this.registry.register('cue', ({ minutes, roomId }) => {
      this.cueService.add({
        id: crypto.randomUUID(),
        roomId,
        atMinutes: minutes,
        label: 'New cue',
        type: 'default',
      });
    });

    /* ---------------- SLOT ---------------- */

    /**
     * Inserts a new performance slot at the given position.
     */
    this.registry.register('slot', ({ minutes, roomId }) => {
      this.slotService.add({
        id: crypto.randomUUID(),
        name: 'New Slot',
        startMinutes: minutes,
        duration: 15,
        roomId,
        playlist: false,
        song: false,
        type: 'performance',
        color: '#3b82f6',
        artists: []
      });
    });

    /* ---------------- BUFFER ---------------- */

    /**
     * Placeholder for buffer insertion.
     */
    this.registry.register('buffer', ({ minutes, roomId }) => {
      console.log('buffer insert', minutes, roomId);
      // TODO buffer service
    });

    /* ---------------- NOTE ---------------- */

    /**
     * Placeholder for note insertion.
     */
    this.registry.register('note', ({ minutes, roomId }) => {
      console.log('note insert', minutes, roomId);
      // TODO note system
    });
  }
}
