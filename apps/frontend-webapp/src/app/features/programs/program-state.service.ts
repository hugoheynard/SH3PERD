import { Injectable } from '@angular/core';

export interface PerformanceTemplate {
  id: string;
  name: string;
  duration: number;
  type: string;
  color: string;
}

export interface PerformanceSlot {
  id: string;
  startMinutes: number;
  duration: number;
  type: string;
  color: string;
  roomId: string;
  artists: Artist[]
}

export interface Room {
  id: string;
  name: string;
}

export interface ProgramState {
  name: string;
  startTime: string;
  endTime: string;
  rooms: Room[];
  slots: PerformanceSlot[];
}

export interface Artist {
  id: string;
  name: string;
}

@Injectable({ providedIn: 'root' })
export class ProgramStateService {

  private state: ProgramState = {
    name: this.defaultProgramName,
    startTime: '12:00',
    endTime: '19:00',
    rooms: [
      { id: 'r1', name: 'Terrasse' },
      { id: 'r2', name: 'LPC' }
    ],
    slots: []
  };

  /** Generates a default program name based on the current date, formatted as "Program DD-MM-YYYY". */
  get defaultProgramName(): string {
    const date = new Date();

    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();

    return `Program ${day}-${month}-${year}`;
  }

  // -------- GETTERS --------

  get program() {
    return this.state;
  }

  get rooms() {
    return this.state.rooms;
  }

  get slots() {
    return this.state.slots;
  }

  // -------- MUTATIONS --------

  setName(name: string) {
    this.state.name = name;
  }

  setStart(time: string) {
    this.state.startTime = time;
  }

  setEnd(time: string) {
    this.state.endTime = time;
  };

  addRoom(name: string) {
    this.state.rooms.push({
      id: crypto.randomUUID(),
      name
    });
  };

  /**
   * Removes a room from the program state. If the room being removed is the default room (the first one in the list), it will not be deleted to ensure there is always at least one room available. Additionally, all performance slots associated with the removed room will also be deleted from the state.
   * @param roomId
   */
  removeRoom(roomId: string) {
    // safe-guard
    if (this.rooms.length <= 1) {
      return;
    }

    // don't delete the first room, it's the default one and we want to keep it as a fallback
    if (this.rooms[0].id === roomId) {
      return;
    }

    // delete all slots associated with the room
    this.state.slots = this.slots.filter(s => s.roomId !== roomId);

    // delete room
    this.state.rooms = this.rooms.filter(r => r.id !== roomId);
  };


  /* ---------------------------------
    SLOT HANDLING
   ---------------------------------- */
  addSlot(slot: PerformanceSlot) {
    this.state.slots.push(slot);
  };

  updateSlot(slot: PerformanceSlot) {
    const index = this.state.slots.findIndex(s => s.id === slot.id);
    if (index !== -1) {
      this.state.slots[index] = slot;
    }
  };

  removeSlot(id: string) {
    this.state.slots =
      this.state.slots.filter(s => s.id !== id);
  };

  getSlotsForRoom(roomId: string) {
    return this.state.slots.filter(s => s.roomId === roomId);
  };


  /* ---------------------------------
    ARTIST HANDLING
   ----------------------------------- */
  /**
   * Adds an artist to a specific performance slot. The method first checks if the slot with the given ID exists. If it does, it then checks if the artist is already associated with that slot to prevent duplicates. If the artist is not already in the slot's list of artists, they are added to the array of artists for that slot.
   * @param slotId
   * @param artist
   */
  addArtistToSlot(slotId: string, artist: Artist) {

    const slot = this.slots.find(s => s.id === slotId);

    if (!slot) {
      return;
    }

    const exists = slot.artists.some(a => a.id === artist.id);

    if (!exists) {
      slot.artists = [...slot.artists, artist];
    }
  };

  /**
   * Removes an artist from a specific performance slot.
   * It finds the slot by ID and removes the artist with the given ID
   * from the slot's artists array.
   */
  removeArtistFromSlot(slotId: string, artistId: string): void {

    const slot = this.slots.find(s => s.id === slotId);
    if (!slot) {
      return;
    }

    const hasArtist = slot.artists.some(a => a.id === artistId);
    if (!hasArtist) {
      return;
    }

    slot.artists = slot.artists.filter(a => a.id !== artistId);
  };
}
