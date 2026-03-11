import { computed, Injectable, signal } from '@angular/core';
import { minutesToTime, time_functions_utils } from '../utils/time_functions_utils';
import type { PlannerArtist, UserGroup, ArtistPerformanceSlot, ProgramState} from '../program-types';
import { AllMockArtists } from '../utils/mockDATAS';

@Injectable({ providedIn: 'root' })
export class ProgramStateService {

  private state = signal<ProgramState>({
    name: this.defaultProgramName,
    startTime: '12:00',
    endTime: '19:00',
    rooms: [
      { id: 'r1', name: 'Terrasse' },
      { id: 'r2', name: 'LPC' }
    ],
    slots: [],
    artists: AllMockArtists,
  });

  name = computed(() => this.state().name);
  startTime = computed(() => this.state().startTime);
  endTime = computed(() => this.state().endTime);
  staff = computed(() => this.state().artists);
  rooms = computed(() => this.state().rooms);
  slots = computed(() => this.state().slots);
  userGroups = signal<UserGroup[]>([]);

  totalMinutes = computed(() => {

    const start = time_functions_utils(this.startTime());
    let end = time_functions_utils(this.endTime());

    if (end <= start) {
      end += 24 * 60;
    }

    return end - start;
  });

  mode= signal<'manual' | 'assisted'>('manual');



  // HYDRATE
  hydrateGroups(groups: UserGroup[]) {
    this.userGroups.set(groups);
  }

  hydrateProgram(program: ProgramState) {
    this.state.set(program)
  }


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
    return this.state();
  };

  // -------- MUTATIONS --------
  changeProgramName(name: string) {
    this.state.update(state => ({
      ...state,
      name: name
    }));
  };

  changeStartTime(time: string) {

    this.state.update(state => ({
      ...state,
      startTime: time
    }));

  }

  changeEndTime(time: string) {

    this.state.update(state => ({
      ...state,
      endTime: time
    }));

  }

  changeProgramMode(newMode: 'manual' | 'assisted') {
    this.mode.set(newMode);
  };

  /* ---------------------------------
  ROOM HANDLING
 ---------------------------------- */
  addRoom() {

    const id = crypto.randomUUID();

    this.state.update(state => ({

      ...state,

      rooms: [
        ...state.rooms,
        {
          id,
          name: 'New Room'
        }
      ]

    }));

  }

  /**
   * Removes a room from the program state. If the room being removed is the default room (the first one in the list), it will not be deleted to ensure there is always at least one room available. Additionally, all performance slots associated with the removed room will also be deleted from the state.
   * @param roomId
   */
  removeRoom(roomId: string) {

    this.state.update(state => {

      const rooms = state.rooms;

      // safeguard
      if (rooms.length <= 1) {
        return state;
      }

      // ne pas supprimer la première room
      if (rooms[0].id === roomId) {
        return state;
      }

      return {

        ...state,

        rooms: state.rooms.filter(r => r.id !== roomId),

        slots: state.slots.filter(s => s.roomId !== roomId)

      };

    });

  }

  /* ---------------------------------
    SLOT HANDLING
   ---------------------------------- */
  /**
   * Adds a new performance slot to the program state. The method takes an ArtistPerformanceSlot object as a parameter and updates the state by appending this new slot to the existing array of slots. This allows for dynamically adding performance slots to the program as needed.
   * @param slot
   */
  addSlot(slot: ArtistPerformanceSlot) {

    this.state.update(state => ({
      ...state,
      slots: [...state.slots, slot]
    }));

  };

  /**
   * Removes a performance slot from the program state based on its unique identifier. The method takes the ID of the slot to be removed as a parameter and updates the state by filtering out the slot with the matching ID from the array of slots. This allows for dynamically removing performance slots from the program as needed.
   * @param id
   */
  removeSlot(id: string) {

    this.state.update(state => ({
      ...state,
      slots: state.slots.filter(s => s.id !== id)
    }));

  }

  /**
   * Updates an existing performance slot in the program state. The method takes an ArtistPerformanceSlot object as a parameter and updates the state by mapping over the existing array of slots and replacing the slot with the matching ID with the new slot data provided. This allows for dynamically updating performance slots in the program as needed.
   * @param slot
   */
  updateSlot(slot: ArtistPerformanceSlot) {

    this.state.update(state => ({

      ...state,

      slots: state.slots.map(s =>
        s.id === slot.id
          ? slot
          : s
      )

    }));

  };

  /**
   * Returns an array of performance slots that are scheduled in a specific room, identified by the provided roomId. The method filters the array of slots in the program state and returns only those slots that have a roomId property matching the given roomId. This allows for retrieving all performance slots associated with a particular room in the program.
   * @param roomId
   */
  getSlotsForRoom(roomId: string) {
    return this.state().slots.filter(s => s.roomId === roomId);
  }

  getSlotStartTime(slot: ArtistPerformanceSlot): string {
    const programStartMinutes = time_functions_utils(this.startTime());
    const absolute = programStartMinutes + slot.startMinutes;
    return minutesToTime(absolute);
  };

  getSlotEndTime(slot: ArtistPerformanceSlot): string {
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
  addArtistToSlot(slotId: string, artist: PlannerArtist) {

    this.state.update(state => ({

      ...state,

      slots: state.slots.map(slot => {

        if (slot.id !== slotId) {
          return slot;
        }

        const exists = slot.artists.some(a => a.id === artist.id);

        if (exists) {
          return slot;
        }

        return {
          ...slot,
          artists: [...slot.artists, artist]
        };

      })

    }));

  };

  /**
   * Removes an artist from a specific performance slot.
   * It finds the slot by ID and removes the artist with the given ID
   * from the slot's artists array.
   */
  removeArtistFromSlot(slotId: string, artistId: string): void {

    this.state.update(state => ({

      ...state,

      slots: state.slots.map(slot => {

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

    }));
  };

  /**
   * Updates the start time of a specific performance slot. It locates the slot by its ID and updates its startMinutes property to the new value provided. This allows for changing the scheduled start time of a performance slot in the program.
   * @param slotId
   * @param startMinutes
   */
  updateSlotStart(slotId: string, startMinutes: number) {

    this.state.update(state => ({

      ...state,

      slots: state.slots.map(slot =>
        slot.id === slotId
          ? { ...slot, startMinutes }
          : slot
      )
    }));
  };

  /**
   * Updates the duration of a specific performance slot. It locates the slot by its ID and updates its duration property to the new value provided. This allows for changing the length of time allocated for a performance slot in the program.
   * @param slotId
   * @param duration
   */
  updateSlotDuration(slotId: string, duration: number) {

    this.state.update(state => ({

      ...state,

      slots: state.slots.map(slot =>
        slot.id === slotId
          ? { ...slot, duration }
          : slot
      )
    }));
  };

  /**
   * Updates the room assignment of a specific performance slot. It locates the slot by its ID and updates its roomId property to the new value provided. This allows for changing the room in which a performance slot is scheduled.
   * @param slotId
   * @param roomId
   */
  updateSlotRoom(slotId: string, roomId: string) {

    this.state.update(state => ({

      ...state,

      slots: state.slots.map(slot =>
        slot.id === slotId
          ? { ...slot, roomId }
          : slot
      )
    }));
  };


  //----GROUPS HANDLING---------

  createUserGroup(group: UserGroup) {
    this.userGroups.update(groups => [...groups, group]);
  };

  addGroupToSlot(slotId: string, group: UserGroup) {

    this.state.update(state => ({

      ...state,

      slots: state.slots.map(slot => {

        if (slot.id !== slotId) {
          return slot;
        }

        const newArtists = group.staff.map(artist => ({
          ...artist,
          sourceUserGroup_id: group.id
        }));

        return {
          ...slot,
          artists: [...slot.artists, ...newArtists]
        };

      })

    }));

  }


}
