import { inject, Injectable } from '@angular/core';
import type { ArtistPerformanceSlot, PlannerArtist } from '../../program-types';
import { ProgramStateService } from '../program-state.service';

/**
 * Service responsible for mutating the state of a slot in the planner.
 * It provides methods to add or remove artists from a specific performance slot.
 * This service is used by the PlannerStateService to update the state of the planner
 * when changes are made to the slots.
 */
@Injectable({ providedIn: 'root' })
export class SlotService {

  private state = inject(ProgramStateService);


  /* ---------------------------------
    SLOT HANDLING
   ---------------------------------- */
  /**
   * Adds a new performance slot to the program state. The method takes an ArtistPerformanceSlot object as a parameter and updates the state by appending this new slot to the existing array of slots. This allows for dynamically adding performance slots to the program as needed.
   * @param slot
   */
  addSlot(slot: ArtistPerformanceSlot) {

    this.state.updateState(state => ({
      ...state,
      slots: [...state.slots, slot]
    }));
  };

  /**
   * Removes a performance slot from the program state based on its unique identifier. The method takes the ID of the slot to be removed as a parameter and updates the state by filtering out the slot with the matching ID from the array of slots. This allows for dynamically removing performance slots from the program as needed.
   * @param id
   */
  removeSlot(id: string) {

    this.state.updateState(state => ({
      ...state,
      slots: state.slots.filter(s => s.id !== id)
    }));
  };

  /**
   * Updates an existing performance slot in the program state. The method takes an ArtistPerformanceSlot object as a parameter and updates the state by mapping over the existing array of slots and replacing the slot with the matching ID with the new slot data provided. This allows for dynamically updating performance slots in the program as needed.
   * @param slot
   */
  updateSlot(slot: ArtistPerformanceSlot) {

    this.state.updateState(state => ({

      ...state,

      slots: state.slots.map(s =>
        s.id === slot.id
          ? slot
          : s
      )
    }));
  };

  /* ---------------------------------
    SLOT TIMING
   ---------------------------------- */

  /**
   * Updates the start time of a specific performance slot. It locates the slot by its ID and updates its startMinutes property to the new value provided. This allows for changing the scheduled start time of a performance slot in the program.
   * @param slotId
   * @param startMinutes
   */
  updateSlotStart(slotId: string, startMinutes: number) {

    this.patchSlot(slotId, slot => ({
      ...slot,
      startMinutes
    }));
  };

  /**
   * Updates the duration of a specific performance slot. It locates the slot by its ID and updates its duration property to the new value provided. This allows for changing the length of time allocated for a performance slot in the program.
   * @param slotId
   * @param duration
   */
  updateSlotDuration(slotId: string, duration: number) {

    this.patchSlot(slotId, slot => ({
      ...slot,
      duration
    }));
  };


  /* ---------------------------------
    ARTIST HANDLING IN SLOTS
   ----------------------------------- */
  /**
   * Adds an artist to a specific performance slot. The method first checks if the slot with the given ID exists. If it does, it then checks if the artist is already associated with that slot to prevent duplicates. If the artist is not already in the slot's list of artists, they are added to the array of artists for that slot.
   * @param slotId
   * @param artist
   */
  addArtistToSlot(slotId: string, artist: PlannerArtist) {

    this.patchSlot(slotId, slot => {

      if (slot.artists.some(a => a.id === artist.id)) {
        return slot;
      }

      return {
        ...slot,
        artists: [...slot.artists, artist]
      };

    });
  };

  /**
   * Removes an artist from a specific performance slot.
   * It finds the slot by ID and removes the artist with the given ID
   * from the slot's artists array.
   */
  removeArtistFromSlot(slotId: string, artistId: string) {

    this.patchSlot(slotId, slot => {

      if (!slot.artists.some(a => a.id === artistId)) {
        return slot;
      }

      return {
        ...slot,
        artists: slot.artists.filter(a => a.id !== artistId)
      };
    });
  };

  /* ---------------------------------
    ROOM HANDLING IN SLOTS
   ------------------------------------*/
  /**
   * Updates the room assignment of a specific performance slot. It locates the slot by its ID and updates its roomId property to the new value provided. This allows for changing the room in which a performance slot is scheduled.
   * @param slotId
   * @param roomId
   */
  updateSlotRoom(slotId: string, roomId: string) {

    this.patchSlot(slotId, slot => ({
      ...slot,
      roomId
    }));
  };

  /* ---------------------------------
  HELPER METHODS
  ----------------------------------- */
  /**
   * A helper method that abstracts the logic of updating a specific slot in the program state. It takes a slot ID and an updater function as parameters. The method updates the state by mapping over the existing array of slots and applying the updater function to the slot with the matching ID, while leaving all other slots unchanged. This allows for a more concise and reusable way to update specific properties of a slot without having to repeat the mapping logic in each individual update method.
   * @param slotId
   * @param updater
   * @private
   */
  private patchSlot(
    slotId: string,
    updater: (slot: ArtistPerformanceSlot) => ArtistPerformanceSlot
  ) {

    this.state.updateState(state => ({

      ...state,

      slots: state.slots.map(slot =>
        slot.id === slotId
          ? updater(slot)
          : slot
      )

    }));

  }

}
