import { inject, Injectable } from '@angular/core';
import type { InsertActionType } from './insert-action.types';
import { InsertLineService } from '../state-services/insert-line.service';
import { InsertActionRegistry } from './insert-action-registry.service';

/**
 * Executes insert actions triggered by the user.
 *
 * ---------------------------------------------------------------------------
 * 🧠 ROLE IN ARCHITECTURE
 * ---------------------------------------------------------------------------
 *
 * Part of the **Insert Interaction System (dispatcher layer)**.
 *
 * This service acts as the **execution bridge** between:
 *
 * - The UI (radial menu / insert button)
 * - The InsertActionRegistry (mapping layer)
 * - The domain logic (via registered handlers)
 *
 * It is the only place responsible for:
 *
 * - Resolving the current insert position
 * - Fetching the correct action handler
 * - Executing the action
 * - Handling insert lifecycle (cleanup)
 *
 * ---------------------------------------------------------------------------
 * 🔄 ARCHITECTURE FLOW
 * ---------------------------------------------------------------------------
 *
 * ```
 * InsertLineComponent (UI)
 *        │
 *        ▼
 * InsertActionService (this)
 *        │
 *        ▼
 * InsertActionRegistry
 *        │
 *        ▼
 * Action handler (CueService, SlotService, etc.)
 * ```
 *
 * ---------------------------------------------------------------------------
 * ⚡ RESPONSIBILITIES
 * ---------------------------------------------------------------------------
 *
 * - Retrieve the current insert state (from InsertLineService)
 * - Resolve the corresponding action handler
 * - Execute the action with a normalized context
 * - Reset insert state after execution
 *
 * ---------------------------------------------------------------------------
 * 🎯 DESIGN PRINCIPLES
 * ---------------------------------------------------------------------------
 *
 * - No business logic in UI components
 * - No switch/case branching
 * - Centralized execution flow
 * - Fully decoupled via registry pattern
 *
 * ---------------------------------------------------------------------------
 * ⚠️ IMPORTANT
 * ---------------------------------------------------------------------------
 *
 * - If no insert state is available → action is ignored
 * - If no handler is registered → warning is logged
 * - After execution → insert state is cleared
 *
 * ---------------------------------------------------------------------------
 * 💡 USAGE
 * ---------------------------------------------------------------------------
 *
 * Typically called from UI:
 *
 * ```ts
 * insertActionService.execute('cue');
 * ```
 *
 * The service automatically:
 * - retrieves current position
 * - executes the correct handler
 * - clears the insert line
 *
 * ---------------------------------------------------------------------------
 * 🚀 EXTENSIONS
 * ---------------------------------------------------------------------------
 *
 * This service is the ideal place to add:
 *
 * - Undo/redo transaction grouping
 * - Analytics tracking (user actions)
 * - Permission checks
 * - Action guards (validation before execution)
 *
 */
@Injectable({ providedIn: 'root' })
export class InsertActionService {

  private insert = inject(InsertLineService);
  private registry = inject(InsertActionRegistry);

  /**
   * Executes an insert action based on the given type.
   *
   * @param type - The insert action identifier
   */
  execute(type: InsertActionType) {

    const state = this.insert.indicator();

    if (!state) {
      return;
    }

    const action = this.registry.get(type);

    if (!action) {
      console.warn(`No insert action registered for "${type}"`);
      return;
    }

    action({
      minutes: state.minutes,
      roomId: state.roomId
    });

    // 🔥 Reset insert state after execution
    this.insert.clear();
  }
}
