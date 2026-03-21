/**
 * Defines all supported insert action types.
 *
 * Each value represents a **user-triggered action** from the insert UI
 * (typically the radial menu).
 *
 * These types are used as keys in the {@link InsertActionRegistry}
 * to resolve the corresponding execution handler.
 *
 * ---------------------------------------------------------------------------
 * 🧠 ROLE IN ARCHITECTURE
 * ---------------------------------------------------------------------------
 *
 * - Acts as the **entry point for user intent**
 * - Decouples UI (radial menu) from domain logic
 * - Enables dynamic mapping via registry pattern
 *
 * ---------------------------------------------------------------------------
 * 🎯 CURRENT ACTIONS
 * ---------------------------------------------------------------------------
 *
 * - `'cue'` → Inserts a timeline cue marker
 * - `'buffer'` → Inserts a buffer / gap block
 * - `'slot'` → Inserts a performance slot
 * - `'note'` → Inserts a timeline note (future feature)
 *
 * ---------------------------------------------------------------------------
 * 🚀 EXTENSIONS
 * ---------------------------------------------------------------------------
 *
 * New actions can be added by:
 *
 * 1. Extending this union type
 * 2. Registering a handler in InsertActionRegistry
 *
 * No changes required in UI components.
 *
 */
export type InsertActionType =
  | 'cue'
  | 'buffer'
  | 'slot'
  | 'note';


/**
 * Context passed to an insert action handler.
 *
 * Represents the **resolved insert position** in timeline coordinates,
 * derived from the {@link InsertLineService}.
 *
 * ---------------------------------------------------------------------------
 * 📦 DATA MODEL
 * ---------------------------------------------------------------------------
 *
 * - `minutes` → Target insertion time (snapped, ≥ 0)
 * - `roomId` → Target room identifier
 *
 * ---------------------------------------------------------------------------
 * ⚠️ IMPORTANT
 * ---------------------------------------------------------------------------
 *
 * - Values are expressed in **minutes**, not pixels
 * - Always derived from a stable insert state (preview or locked)
 * - Guaranteed to be valid when passed to handlers
 *
 * ---------------------------------------------------------------------------
 * 💡 USAGE
 * ---------------------------------------------------------------------------
 *
 * ```ts
 * handler({ minutes, roomId }) {
 *   slotService.addSlot({
 *     startMinutes: minutes,
 *     roomId
 *   });
 * }
 * ```
 *
 */
export interface InsertActionContext {
  /** Target insertion time in minutes */
  minutes: number;

  /** Target room identifier */
  roomId: string;
}


/**
 * Function signature for an insert action handler.
 *
 * Each handler defines how a specific insert action (cue, slot, etc.)
 * is executed in the domain layer.
 *
 * ---------------------------------------------------------------------------
 * 🧠 ROLE IN ARCHITECTURE
 * ---------------------------------------------------------------------------
 *
 * - Encapsulates domain logic for a given insert action
 * - Registered dynamically in {@link InsertActionRegistry}
 * - Executed via {@link InsertActionService}
 *
 * ---------------------------------------------------------------------------
 * ⚡ BEHAVIOR
 * ---------------------------------------------------------------------------
 *
 * - Receives a validated {@link InsertActionContext}
 * - Performs a state mutation (via domain services)
 * - Does NOT handle UI concerns
 *
 * ---------------------------------------------------------------------------
 * ⚠️ IMPORTANT
 * ---------------------------------------------------------------------------
 *
 * - Must be **purely imperative** (no return value)
 * - Should rely on domain services for state updates
 * - Should not access DOM or UI state directly
 *
 * ---------------------------------------------------------------------------
 * 💡 EXAMPLE
 * ---------------------------------------------------------------------------
 *
 * ```ts
 * registry.register('cue', ({ minutes, roomId }) => {
 *   cueService.addCue({
 *     id: generateId(),
 *     roomId,
 *     atMinutes: minutes
 *   });
 * });
 * ```
 *
 */
export type InsertActionHandler = (ctx: InsertActionContext) => void;
