import { inject, Injectable } from '@angular/core';
import { ProgramStateService } from './program-state.service';
import type { ProgramState } from '../program-types';


/**
 * Manages the undo/redo history of the program state.
 *
 * This service acts as a **middleware layer** between the UI (or domain services)
 * and the ProgramStateService.
 *
 * It is responsible for:
 *
 * - Recording state snapshots before mutations
 * - Providing undo / redo capabilities
 * - Ensuring immutability through deep cloning
 *
 * ---------------------------------------------------------------------------
 * 🧠 ROLE IN ARCHITECTURE
 * ---------------------------------------------------------------------------
 *
 * This service wraps state updates and should be the **only entry point**
 * for mutating the program when history tracking is required.
 *
 * Flow:
 *
 * UI / Services
 *     ↓
 * ProgramHistoryService (this)
 *     ↓
 * ProgramStateService (source of truth)
 *
 * ---------------------------------------------------------------------------
 * ⚡ FEATURES
 * ---------------------------------------------------------------------------
 *
 * - Undo / Redo stack management
 * - Snapshot isolation (via structuredClone)
 * - History size limiting
 *
 * ---------------------------------------------------------------------------
 * ⚠️ IMPORTANT
 * ---------------------------------------------------------------------------
 *
 * - ProgramStateService MUST NOT depend on this service
 * - All state mutations should go through `updateState()` for history tracking
 * - Preview / transient updates (drag, hover) should NOT be recorded
 *
 * ---------------------------------------------------------------------------
 * 🚀 EXTENSIONS
 * ---------------------------------------------------------------------------
 *
 * This service can be extended to support:
 *
 * - Action grouping (batch undo for drag operations)
 * - Time-travel debugging
 * - Persistent history (localStorage / backend)
 *
 */
@Injectable({ providedIn: 'root' })
export class ProgramHistoryService {

  private state = inject(ProgramStateService);

  private past: ProgramState[] = [];
  private future: ProgramState[] = [];

  /* ------------------ RECORD ------------------ */
  /**
   * Applies a state update while recording the previous state in history.
   *
   * This is the preferred way to mutate the program state when undo/redo
   * support is required.
   *
   * @param updater - Function that receives the current state and returns a new state
   */
  updateState(updater: (state: ProgramState) => ProgramState) {

    const current = this.state.program();

    this.past.push(structuredClone(current));

    this.limitHistorySize(50);

    this.future = [];

    this.state.updateState(updater);
  };


  /* ------------------ RECORD ------------------ */
  /**
   * Manually records a snapshot of the provided state.
   *
   * Useful for advanced scenarios where state updates are controlled externally
   * or need custom batching.
   *
   * ⚠️ Usually not needed if `updateState()` is used consistently.
   *
   * @param previous - State snapshot to store in history
   */
  record(previous: ProgramState) {
    this.past.push(structuredClone(previous));

    if (this.past.length > 50) {
      this.past.shift();
    }

    this.future = [];
  }

  /* ------------------ UNDO ------------------ */
  /**
   * Reverts the program state to the previous snapshot.
   *
   * - Moves current state to the future stack
   * - Restores the last state from the past stack
   *
   * No-op if no previous state exists.
   */
  undo() {
    const previous = this.past.pop();

    if (!previous) {
      return;
    }

    const current = this.state.program();

    this.future.push(structuredClone(current));
    this.state.hydrateProgram(previous);
  };

  /* ------------------ REDO ------------------ */
  /**
   * Re-applies a previously undone state.
   *
   * - Moves current state to the past stack
   * - Restores the next state from the future stack
   *
   * No-op if no future state exists.
   */
  redo() {
    const next = this.future.pop();
    if (!next) {
      return;
    }

    const current = this.state.program();

    this.past.push(structuredClone(current));
    this.state.hydrateProgram(next);
  };

  /* ------------------ UTILS ------------------ */
  limitHistorySize(size: number = 50): void {

    if (this.past.length > size) {
      this.past.shift();
    }
  };

  canUndo() {
    return this.past.length > 0;
  }

  canRedo() {
    return this.future.length > 0;
  }
}
