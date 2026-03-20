import { inject, Injectable } from '@angular/core';
import { ProgramHistoryService } from '../program-history.service';
import type { ProgramState } from '../../program-types';

type ArrayKeys<T> = {
  [K in keyof T]: T[K] extends any[] ? K : never
}[keyof T];

type Exact<T, U extends T> =
  U & Record<Exclude<keyof U, keyof T>, never>;

/**
 * Generic base service for managing collections of entities
 * stored in the {@link ProgramState}.
 *
 * This class abstracts common CRUD operations for any array-based
 * state property (slots, cues, buffers, etc.), while delegating
 * domain-specific logic to concrete services.
 *
 * ---------------------------------------------------------------------------
 * 🧠 ROLE IN ARCHITECTURE
 * ---------------------------------------------------------------------------
 *
 * Part of the **State Mutation Layer**.
 *
 * This service:
 *
 * - Centralizes immutable updates on array-based state properties
 * - Integrates with {@link ProgramHistoryService} for undo/redo support
 * - Provides reusable low-level operations (add, remove, patch)
 *
 * Concrete services (SlotService, CueService, etc.) extend this class
 * to implement domain-specific behaviors.
 *
 * ---------------------------------------------------------------------------
 * ⚡ GENERIC DESIGN
 * ---------------------------------------------------------------------------
 *
 * The generic parameter `K` represents a key of {@link ProgramState}
 * whose value is an array.
 *
 * Example:
 *
 * ```ts
 * class SlotService extends BaseItemManager<'slots'> {
 *    constructor() {
 *      super('slots');
 *    }
 *  }
 * ```
 *
 * Internally:
 *
 * - `ProgramState[K]` → array of items
 * - `ProgramState[K][number]` → single item type
 *
 * ---------------------------------------------------------------------------
 * ⚠️ TYPE SAFETY
 * ---------------------------------------------------------------------------
 *
 * Only keys corresponding to array properties are allowed,
 * enforced via the `ArrayKeys<T>` utility type.
 *
 * Internal casts are used to assist TypeScript with indexed access,
 * but remain safe due to the generic constraint.
 *
 * ---------------------------------------------------------------------------
 * 🧩 PROVIDED OPERATIONS
 * ---------------------------------------------------------------------------
 *
 * - `add(item)` → append a new item
 * - `remove(id)` → remove item by ID
 * - `patch(id, updater)` → update item partially
 *
 * These methods are intentionally minimal and generic.
 *
 * ---------------------------------------------------------------------------
 * 🚀 EXTENSIONS
 * ---------------------------------------------------------------------------
 *
 * Concrete services should implement:
 *
 * - Domain-specific mutations (e.g. addArtistToSlot)
 * - Factory methods (e.g. createDefaultSlot)
 * - Higher-level operations (duplicate, move, etc.)
 *
 * ---------------------------------------------------------------------------
 * 💡 DESIGN PRINCIPLES
 * ---------------------------------------------------------------------------
 *
 * - Immutable updates only
 * - No UI logic
 * - No business-specific rules
 * - Single responsibility: mutate collections safely
 */
@Injectable()
export abstract class BaseTimelineItemCRUD<
  K extends ArrayKeys<ProgramState>
> {

  /**
   * Program history service used to apply state updates
   * while recording undo/redo snapshots.
   */
  protected history = inject(ProgramHistoryService);

  /**
   * Key of the ProgramState property managed by this service.
   *
   * Must reference an array-based property (e.g. 'slots', 'cues').
   */
  protected constructor(protected key: K) {}

  /**
   * Applies a transformation function to the managed collection.
   *
   * This is the core mutation mechanism used by all operations.
   *
   * @param updater - Function receiving current items and returning updated items
   */
  protected update(
    updater: (items: ProgramState[K]) => ProgramState[K]
  ) {
    this.history.updateState(state => {
      const items = state[this.key] as ProgramState[K];

      return {
        ...state,
        [this.key]: updater(items)
      };
    });
  }

  /**
   * Adds a new item to the collection.
   *
   * @param item - Item to append
   */
  add(item: ProgramState[K][number]) {
    this.update(items => [...items, item] as ProgramState[K]);
  }

  /**
   * Removes an item from the collection by its ID.
   *
   * @param id - Unique identifier of the item to remove
   */
  remove(id: string) {
    this.update(items =>
      items.filter(i => 'id' in i && i.id !== id) as ProgramState[K]
    );
  }

  /**
   * Applies a partial update to a specific item.
   *
   * @param id - Target item ID
   * @param updater - Function returning the updated item
   */
  patch<U extends ProgramState[K][number]>(
    id: string,
    updater: (
      item: Readonly<ProgramState[K][number]>
    ) => Exact<ProgramState[K][number], U>
  ) {
    this.history.updateState(state => {
      const items = state[this.key] as ProgramState[K];

      let changed = false;

      const updatedItems = items.map((i: ProgramState[K][number]) => {
        if ('id' in i && i.id === id) {
          const updated = updater(i);

          if (updated !== i) {
            changed = true;
            return updated;
          }
        }

        return i;
      }) as ProgramState[K];

      // avoid useless update
      if (!changed) {
        return state;
      }

      return {
        ...state,
        [this.key]: updatedItems
      };
    });
  }

  //TODO : patch many , same type security?

  /**
   * Factory method to be implemented by child services.
   * Defines how a default item is created.
   */
  protected abstract createDefault(
    input: unknown
  ): ProgramState[K][number];
}
