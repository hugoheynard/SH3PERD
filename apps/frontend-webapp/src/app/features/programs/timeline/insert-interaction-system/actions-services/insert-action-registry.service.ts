import { Injectable } from '@angular/core';
import type { InsertActionHandler, InsertActionType } from './insert-action.types';


/**
 * Registry responsible for managing insert actions within the planner.
 *
 * ---------------------------------------------------------------------------
 * 🧠 ROLE IN ARCHITECTURE
 * ---------------------------------------------------------------------------
 *
 * Part of the **Insert Interaction System**.
 *
 * This service acts as a **central registry** mapping an
 * `InsertActionType` (e.g. 'cue', 'slot', 'buffer') to its corresponding
 * execution handler.
 *
 * It is conceptually similar to:
 *
 * - `DragPreviewRegistryService` → maps drag types to preview components
 * - but here → maps insert types to execution logic
 *
 * ---------------------------------------------------------------------------
 * ⚡ RESPONSIBILITIES
 * ---------------------------------------------------------------------------
 *
 * - Register insert actions dynamically
 * - Provide lookup for action handlers at runtime
 * - Decouple UI from domain logic
 *
 * ---------------------------------------------------------------------------
 * 🔄 ARCHITECTURE FLOW
 * ---------------------------------------------------------------------------
 *
 * ```
 * InsertLineComponent (UI)
 *        │
 *        ▼
 * InsertActionService (dispatcher)
 *        │
 *        ▼
 * InsertActionRegistry (this)
 *        │
 *        ▼
 * Action handler (CueService, SlotService, etc.)
 * ```
 *
 * ---------------------------------------------------------------------------
 * 🎯 DESIGN GOALS
 * ---------------------------------------------------------------------------
 *
 * - Avoid switch/case logic in UI components
 * - Enable easy extension of new insert actions
 * - Keep domain logic isolated from presentation layer
 *
 * ---------------------------------------------------------------------------
 * 💡 USAGE
 * ---------------------------------------------------------------------------
 *
 * Registration (usually in an init service):
 *
 * ```ts
 * registry.register('cue', ctx => {
 *   cueService.addCue(...);
 * });
 * ```
 *
 * Execution (via InsertActionService):
 *
 * ```ts
 * const handler = registry.get(type);
 * handler?.(context);
 * ```
 *
 * ---------------------------------------------------------------------------
 * ⚠️ IMPORTANT
 * ---------------------------------------------------------------------------
 *
 * - Each action type should be registered once
 * - Duplicate registrations will trigger a warning
 * - Missing actions will result in no-op (handled upstream)
 *
 * ---------------------------------------------------------------------------
 * 🚀 EXTENSIONS
 * ---------------------------------------------------------------------------
 *
 * This registry can be extended to support:
 *
 * - Permission-based actions (enable/disable per user)
 * - Dynamic configuration (backend-driven actions)
 * - Analytics / logging of user interactions
 * - Undo/redo integration hooks
 *
 */
@Injectable({ providedIn: 'root' })
export class InsertActionRegistry {

  /**
   * Internal map of action handlers indexed by their type.
   */
  private actions = new Map<InsertActionType, InsertActionHandler>();

  /**
   * Registers an insert action handler.
   *
   * @param type - Unique identifier of the insert action
   * @param handler - Function executed when the action is triggered
   */
  register(type: InsertActionType, handler: InsertActionHandler) {
    if (this.actions.has(type)) {
      console.warn(`Insert action "${type}" already registered`);
    }

    this.actions.set(type, handler);
  };

  /**
   * Retrieves the handler associated with a given insert action type.
   *
   * @param type - Insert action identifier
   * @returns The corresponding handler, or undefined if not registered
   */
  get(type: InsertActionType): InsertActionHandler | undefined {
    return this.actions.get(type);
  };
}
