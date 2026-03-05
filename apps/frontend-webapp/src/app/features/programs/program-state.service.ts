import { computed, Injectable, signal } from '@angular/core';
import { minutesToTime, time_functions_utils } from './utils/time_functions_utils';

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

  name = signal(this.defaultProgramName);
  startTime = signal('12:00');
  endTime = signal('19:00');

  totalMinutes = computed(() => {

    const start = time_functions_utils(this.startTime());
    let end = time_functions_utils(this.endTime());

    if (end <= start) {
      end += 24 * 60;
    }

    return end - start;
  });

  slots = signal<PerformanceSlot[]>([]);
  rooms = signal<Room[]>([
    { id: 'r1', name: 'Terrasse' },
    { id: 'r2', name: 'LPC' }
  ]);

  mode= signal<'manual' | 'assisted'>('manual');


  // -------- GETTERS --------
  /** Generates a default program name based on the current date, formatted as "Program DD-MM-YYYY". */
  get defaultProgramName(): string {
    const date = new Date();

    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();

    return `Program ${day}-${month}-${year}`;
  }

  /**
   * Returns the current state of the program, including its name, start and end times, rooms, and performance slots. This getter compiles all relevant information about the program into a single object that can be easily accessed and used throughout the application.
   */
  get program(): ProgramState {
    return {
      name: this.name(),
      startTime: this.startTime(),
      endTime: this.endTime(),
      rooms: this.rooms(),
      slots: this.slots(),
    };
  };

  // -------- MUTATIONS --------
  changeProgramName(name: string) {
    this.name.set(name);
  };

  changeStartTime(time: string) {
    this.startTime.set(time);
  };

  changeEndTime(time: string) {
    this.endTime.set(time);
  };

  changeProgramMode(newMode: 'manual' | 'assisted') {
    this.mode.set(newMode);
  };

  /* ---------------------------------
  ROOM HANDLING
 ---------------------------------- */
  addRoom() {

    const id = crypto.randomUUID();

    this.rooms.update(rooms => [
      ...rooms,
      {
        id,
        name: 'New Room'
      }
    ]);
  }

  /**
   * Removes a room from the program state. If the room being removed is the default room (the first one in the list), it will not be deleted to ensure there is always at least one room available. Additionally, all performance slots associated with the removed room will also be deleted from the state.
   * @param roomId
   */
  removeRoom(roomId: string) {

    const rooms = this.rooms();

    // safeguard
    if (rooms.length <= 1) {
      return;
    }

    // ne pas supprimer la première room
    if (rooms[0].id === roomId) {
      return;
    }

    // 1️⃣ supprimer les slots liés
    this.slots.update(slots =>
      slots.filter(s => s.roomId !== roomId)
    );

    // 2️⃣ supprimer la room
    this.rooms.update(rooms =>
      rooms.filter(r => r.id !== roomId)
    );
  }

  /* ---------------------------------
    SLOT HANDLING
   ---------------------------------- */
  addSlot(slot: PerformanceSlot) {
    this.slots.update(slots => [
      ...slots,
      slot
    ]);
  };

  removeSlot(id: string) {
    this.slots.update(slots =>
      slots.filter(s => s.id !== id)
    );
  };

  updateSlot(slot: PerformanceSlot) {
    const index = this.state.slots.findIndex(s => s.id === slot.id);
    if (index !== -1) {
      this.state.slots[index] = slot;
    }
  };

  getSlotsForRoom(roomId: string) {
    return this.state.slots.filter(s => s.roomId === roomId);
  };

  getSlotStartTime(slot: PerformanceSlot): string {
    const programStartMinutes = time_functions_utils(this.startTime());
    const absolute = programStartMinutes + slot.startMinutes;
    return minutesToTime(absolute);
  };

  getSlotEndTime(slot: PerformanceSlot): string {
    const programStartMinutes = time_functions_utils(this.startTime());
    const absolute =
      programStartMinutes + slot.startMinutes + slot.duration;
    return minutesToTime(absolute);
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
    this.slots.update(slots =>
      slots.map(slot => {

        if (slot.id !== slotId) {
          return slot;
        }

        const exists =
          slot.artists.some(a => a.id === artist.id);

        if (exists) {
          return slot;
        }

        return {
          ...slot,
          artists: [...slot.artists, artist]
        };
      })
    );
  }

  /**
   * Removes an artist from a specific performance slot.
   * It finds the slot by ID and removes the artist with the given ID
   * from the slot's artists array.
   */
  removeArtistFromSlot(slotId: string, artistId: string): void {
    this.slots.update(slots =>
      slots.map(slot => {

        if (slot.id !== slotId) {
          return slot;
        }

        if (!slot.artists.some(a => a.id === artistId)) {
          return slot;
        }

        return {
          ...slot,
          artists: slot.artists.filter(a => a.id !== artistId)
        };
      })
    );
  }
}
