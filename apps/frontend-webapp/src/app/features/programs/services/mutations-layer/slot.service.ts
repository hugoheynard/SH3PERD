import { Injectable } from '@angular/core';
import type { ArtistPerformanceSlot, PlannerArtist } from '../../program-types';
import { BaseTimelineItemCRUD } from './BaseTimelineItemCRUD';

/**
 * Service responsible for mutating the state of a slot in the planner.
 * It provides methods to add or remove artists from a specific performance slot.
 * This service is used by the PlannerStateService to update the state of the planner
 * when changes are made to the slots.
 */
@Injectable({ providedIn: 'root' })
export class SlotService
  extends BaseTimelineItemCRUD<'slots'>{

  constructor() {
    super('slots');
  }


  /* ---------------------------------
    SLOT HANDLING
   ---------------------------------- */
  /**
   * Updates an existing performance slot in the program state. The method takes an ArtistPerformanceSlot object as a parameter and updates the state by mapping over the existing array of slots and replacing the slot with the matching ID with the new slot data provided. This allows for dynamically updating performance slots in the program as needed.
   * @param slot
   */
  replaceSlot(slot: ArtistPerformanceSlot) {

    this.history.updateState(state => ({

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

    this.patch(slotId, slot => ({
      ...slot,
      startMinutes
    }));
  };

  updateManySlotsStart(
    updates: { id: string; startMinutes: number }[]
  ) {

    for (const update of updates) {
      this.updateSlotStart(update.id, update.startMinutes);
    }
  }


  /**
   * Updates the duration of a specific performance slot. It locates the slot by its ID and updates its duration property to the new value provided. This allows for changing the length of time allocated for a performance slot in the program.
   * @param slotId
   * @param duration
   */
  updateSlotDuration(slotId: string, duration: number) {

    this.patch(slotId, slot => ({
      ...slot,
      duration
    }));
  };


  /* ---------------------------------
    ARTIST HANDLING IN SLOTS ---------------- */
  /**
   * Adds an artist to a specific performance slot. The method first checks if the slot with the given ID exists. If it does, it then checks if the artist is already associated with that slot to prevent duplicates. If the artist is not already in the slot's list of artists, they are added to the array of artists for that slot.
   * @param slotId
   * @param artist
   */
  addArtistToSlot(slotId: string, artist: PlannerArtist) {

    this.patch(slotId, slot => {

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

    this.patch(slotId, slot => {

      if (!slot.artists.some(a => a.id === artistId)) {
        return slot;
      }

      return {
        ...slot,
        artists: slot.artists.filter(a => a.id !== artistId)
      };
    });
  };

  // -------ROOM HANDLING IN SLOTS ---------------//
  /**
   * Updates the room assignment of a specific performance slot. It locates the slot by its ID and updates its roomId property to the new value provided. This allows for changing the room in which a performance slot is scheduled.
   * @param slotId
   * @param roomId
   */
  updateSlotRoom(slotId: string, roomId: string) {

    this.patch(slotId, slot => ({
      ...slot,
      room_id: roomId
    }));
  };

  // ------------- HELPER METHODS ---------------- //

  /**
   * Creates a default slot
   * @param p
   */
  createDefault(p: {
    startMinutes: number;
    roomId: string;
    id: string;
    overrides?: Partial<ArtistPerformanceSlot>;
  }): ArtistPerformanceSlot {
    return {
      id: p.id,
      name: 'New Slot',
      startMinutes: p.startMinutes,
      duration: 15,
      room_id: p.roomId,
      type: 'performance',
      color: '#3b82f6',
      artists: [],
      playlist: false,
      song: false,
      ...p.overrides
    };
  }
}
