import { computed, Injectable, signal } from '@angular/core';


/**
 * Manages the insert line state within the planner timeline.
 *
 * This service represents the **visual insertion indicator**
 * displayed during drag & drop operations.
 *
 * It provides a reactive, centralized state describing:
 *
 * - The **target insertion time** (in minutes)
 * - The **target room**
 * - Whether the insertion spans **multiple rooms**
 *
 * ---------------------------------------------------------------------------
 * 🧠 ROLE IN ARCHITECTURE
 * ---------------------------------------------------------------------------
 *
 * Part of the **Interaction Layer**.
 *
 * This service:
 *
 * - Does NOT mutate program state
 * - Does NOT perform spatial calculations
 * - Only reflects **ephemeral UI state** during interactions
 *
 * It is typically driven by:
 *
 * - `TimelineInteractionService` → sets position
 * - `TimelineSpatialService` → provides projected minutes/room
 *
 * ---------------------------------------------------------------------------
 * ⚡ RESPONSIBILITIES
 * ---------------------------------------------------------------------------
 *
 * - Store the current insert position (minutes + room)
 * - Expose a computed indicator for UI rendering
 * - Handle lifecycle (set / clear)
 *
 * ---------------------------------------------------------------------------
 * 📦 STATE MODEL
 * ---------------------------------------------------------------------------
 *
 * Internal signals:
 *
 * - `_minutes` → insertion time (null when inactive)
 * - `_roomId` → target room (null when inactive)
 * - `_multiRoom` → whether the indicator spans multiple rooms
 *
 * Public API:
 *
 * - `minutes` → readonly signal
 * - `roomId` → readonly signal
 * - `multiRoom` → readonly signal
 *
 * - `indicator` → computed object or null
 *
 * ---------------------------------------------------------------------------
 * 🎯 INDICATOR
 * ---------------------------------------------------------------------------
 *
 * The `indicator` computed signal returns:
 *
 * ```ts
 * {
 *   minutes: number;
 *   roomId: string;
 *   multiRoom: boolean;
 * }
 * ```
 *
 * or `null` if no valid insertion is active.
 *
 * This is the main entry point for UI components.
 *
 * ---------------------------------------------------------------------------
 * ⚠️ IMPORTANT
 * ---------------------------------------------------------------------------
 *
 * - Values are expressed in **timeline minutes**, not pixels
 * - Pixel conversion must be handled by UI (via PlannerResolutionService)
 * - This service must remain **purely declarative**
 *
 * ---------------------------------------------------------------------------
 * 🚀 EXTENSIONS
 * ---------------------------------------------------------------------------
 *
 * This service can be extended to support:
 *
 * - Multi-room insertion previews
 * - Collision-aware insertion
 * - Ghost preview positioning
 * - Smart snapping feedback
 *
 */
@Injectable({ providedIn: 'root' })
export class InsertLineService {

  /**
   * Internal signal storing the insertion time in minutes.
   * `null` means no active insert line.
   */
  private _minutes = signal<number | null>(null);

  /**
   * Internal signal storing the target room ID.
   * `null` means no active insert line.
   */
  private _room_id = signal<string | null>(null);

  /**
   * Indicates whether the insert line spans multiple rooms.
   */
  private _multiRoom = signal(false);

  /**
   * Read-only signal exposing the insertion time.
   */
  minutes = this._minutes.asReadonly();

  /**
   * Read-only signal exposing the target room ID.
   */
  roomId = this._room_id.asReadonly();

  /**
   * Read-only signal indicating multi-room insertion.
   */
  multiRoom = this._multiRoom.asReadonly();

  /**
   * Computed indicator used by UI components.
   *
   * Returns a structured object when an insertion is active,
   * or `null` otherwise.
   */
  readonly indicator = computed(() => {
    const minutes = this._minutes();
    const roomId = this._room_id();

    if (minutes === null || roomId === null) {
      return null;
    }

    return {
      minutes,
      roomId: roomId,
      multiRoom: this._multiRoom()
    };
  });

  /**
   * Sets the insert line state.
   *
   * @param minutes - Target insertion time (in minutes)
   * @param room_id - Target room ID
   * @param multiRoom - Whether the insert spans multiple rooms
   */
  set(minutes: number, room_id: string, multiRoom: boolean) {
    this._minutes.set(minutes);
    this._room_id.set(room_id);
    this._multiRoom.set(multiRoom);
  }

  /**
   * Clears the insert line state.
   *
   * Resets all signals and removes the indicator from the UI.
   */
  clear() {
    this._minutes.set(null);
    this._room_id.set(null);
    this._multiRoom.set(false);
  }
}
