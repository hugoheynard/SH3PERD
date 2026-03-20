import { computed, Injectable, signal } from '@angular/core';

/**
 * Represents a valid insert position in the timeline.
 *
 * All values are expressed in **timeline coordinates** (not pixels).
 */
export type InsertState = {
  /** Target time in minutes */
  minutes: number;

  /** Target room identifier */
  roomId: string;

  /** Whether the insert spans multiple rooms */
  multiRoom: boolean;
};

/**
 * Manages the insert line state within the planner timeline.
 *
 * ---------------------------------------------------------------------------
 * 🧠 ROLE IN ARCHITECTURE
 * ---------------------------------------------------------------------------
 *
 * Part of the **Interaction Layer**.
 *
 * This service represents a **pure UI state** describing where an element
 * could be inserted in the timeline.
 *
 * It does NOT:
 * - mutate program state
 * - perform spatial calculations
 *
 * It is driven by:
 * - `TimelineSpatialService` → provides projection (minutes + room)
 * - `TimelineInteractionService` → controls when updates occur
 *
 * ---------------------------------------------------------------------------
 * ⚡ CORE CONCEPT
 * ---------------------------------------------------------------------------
 *
 * The insert line has **two modes**:
 *
 * 1. **Preview mode (hover)**
 *    → follows pointer (ALT mode)
 *
 * 2. **Locked mode (user intent)**
 *    → frozen position after clicking "+"
 *    → used for radial menu actions
 *
 * The active state is resolved as:
 *
 * ```
 * indicator = locked ?? preview
 * ```
 *
 * ---------------------------------------------------------------------------
 * 📦 STATE MODEL
 * ---------------------------------------------------------------------------
 *
 * Internal signals:
 *
 * - `_preview` → live pointer-driven state
 * - `_locked` → frozen state (after user action)
 *
 * Public signals:
 *
 * - `indicator` → active insert state (locked has priority)
 * - `minutes`, `roomId`, `multiRoom` → derived helpers
 *
 * ---------------------------------------------------------------------------
 * 🎯 RESPONSIBILITIES
 * ---------------------------------------------------------------------------
 *
 * - Store insert position (minutes + room)
 * - Handle preview vs locked state
 * - Expose a reactive indicator for UI
 * - Control lifecycle (set / lock / unlock / clear)
 *
 * ---------------------------------------------------------------------------
 * ⚠️ IMPORTANT
 * ---------------------------------------------------------------------------
 *
 * - Values are always in **minutes**, never pixels
 * - UI is responsible for px conversion (via PlannerResolutionService)
 * - Locking freezes the state and ignores pointer updates
 *
 * ---------------------------------------------------------------------------
 * 🚀 EXTENSIONS
 * ---------------------------------------------------------------------------
 *
 * - Ghost preview positioning
 * - Multi-room insertion
 * - Smart snapping feedback
 * - Insert tool mode (non-ALT)
 *
 */
@Injectable({ providedIn: 'root' })
export class InsertLineService {

  /* ---------------------------------------------------------------------------
   * 🧩 INTERNAL STATE
   * --------------------------------------------------------------------------- */

  /** Live pointer-driven preview state */
  private _preview = signal<InsertState | null>(null);

  /** Locked state after user confirmation (click "+") */
  private _locked = signal<InsertState | null>(null);

  /** ALT key mode (enables insert preview) */
  private _altMode = signal(false);


  /* ---------------------------------------------------------------------------
   * 📡 PUBLIC STATE
   * --------------------------------------------------------------------------- */

  /**
   * Active insert indicator.
   *
   * - Returns locked state if present
   * - Otherwise returns preview state
   */
  readonly indicator = computed(() => {
    return this._locked() ?? this._preview();
  });

  /** Read-only signal exposing the insertion time */
  readonly minutes = computed(() => this.indicator()?.minutes ?? null);

  /** Read-only signal exposing the target room */
  readonly roomId = computed(() => this.indicator()?.roomId ?? null);

  /** Read-only signal indicating multi-room insert */
  readonly multiRoom = computed(() => this.indicator()?.multiRoom ?? false);

  /** Whether ALT insert mode is active */
  readonly altMode = this._altMode.asReadonly();

  /** Whether the insert line is currently locked */
  readonly isLocked = computed(() => this._locked() !== null);


  /* ---------------------------------------------------------------------------
   * ⚡ ACTIONS
   * --------------------------------------------------------------------------- */

  /**
   * Updates the preview insert position.
   *
   * Ignored if a lock is active.
   */
  set(minutes: number, roomId: string, multiRoom: boolean) {
    if (this._locked()) {
      return;
    }

    this._preview.set({
      minutes,
      roomId,
      multiRoom
    });
  }

  /**
   * Locks the current preview state.
   *
   * Called when the user clicks the "+" button.
   * Freezes the insert position and disables pointer updates.
   */
  lock() {
    const current = this._preview();
    if (!current) return;

    this._locked.set(current);
  }

  /**
   * Unlocks the insert line.
   *
   * Does NOT clear preview automatically.
   */
  unlock() {
    this._locked.set(null);
  }

  /**
   * Clears all insert state.
   *
   * Removes both preview and locked state.
   */
  clear() {
    this._preview.set(null);
    this._locked.set(null);
  }


  /* ---------------------------------------------------------------------------
   * ⌨️ ALT MODE
   * --------------------------------------------------------------------------- */

  /** Enables insert preview mode */
  enableAltMode() {
    this._altMode.set(true);
  }

  /** Disables insert preview mode */
  disableAltMode() {
    this._altMode.set(false);
  }
}
