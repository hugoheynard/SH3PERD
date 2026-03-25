import { inject, Injectable } from '@angular/core';
import { MusicLibraryStateService } from '../music-library-state.service';
import type { MusicLibraryState } from '../../music-library-types';

type ArrayKeys<T> = {
  [K in keyof T]: T[K] extends any[] ? K : never
}[keyof T] & keyof T;

type Exact<T, U extends T> =
  U & Record<Exclude<keyof U, keyof T>, never>;

/**
 * Generic base service for managing collections of entities
 * stored in {@link MusicLibraryState}.
 *
 * Mirrors the pattern of BaseTimelineItemCRUD but for the music library domain.
 * No history/undo-redo — direct state updates only.
 *
 * Concrete services (MusicReferenceService, MusicRepertoireService, etc.)
 * extend this class to implement domain-specific behaviors.
 */
@Injectable()
export abstract class BaseMusicItemCRUD<
  K extends ArrayKeys<MusicLibraryState>
> {

  /** Direct access to the music library state service. */
  protected state = inject(MusicLibraryStateService);

  /**
   * Key of the MusicLibraryState property managed by this service.
   * Must reference an array-based property (e.g. 'references', 'repertoire').
   */
  protected constructor(protected key: K) {}

  /**
   * Applies a transformation function to the managed collection.
   * This is the core mutation mechanism used by all operations.
   */
  protected update(
    updater: (items: MusicLibraryState[K]) => MusicLibraryState[K]
  ): void {
    this.state.updateState(state => {
      const items = state[this.key] as MusicLibraryState[K];
      return {
        ...state,
        [this.key]: updater(items),
      };
    });
  }

  /**
   * Adds a new item to the collection.
   */
  add(item: MusicLibraryState[K][number]): void {
    this.update(items => [...items, item] as MusicLibraryState[K]);
  }

  /**
   * Removes an item from the collection by its ID.
   */
  remove(id: string): void {
    this.update(items =>
      items.filter(i => 'id' in i && i.id !== id) as MusicLibraryState[K]
    );
  }

  /**
   * Applies a partial update to a specific item by ID.
   */
  patch<U extends MusicLibraryState[K][number]>(
    id: string,
    updater: (
      item: Readonly<MusicLibraryState[K][number]>
    ) => Exact<MusicLibraryState[K][number], U>
  ): void {
    this.state.updateState(state => {
      const items = state[this.key] as MusicLibraryState[K];

      let changed = false;

      const updatedItems = items.map((i: MusicLibraryState[K][number]) => {
        if ('id' in i && i.id === id) {
          const updated = updater(i);
          if (updated !== i) {
            changed = true;
            return updated;
          }
        }
        return i;
      }) as MusicLibraryState[K];

      if (!changed) {
        return state;
      }

      return {
        ...state,
        [this.key]: updatedItems,
      };
    });
  }

  /**
   * Factory method to be implemented by child services.
   * Defines how a default item is created.
   */
  protected abstract createDefault(
    input: unknown
  ): MusicLibraryState[K][number];
}
