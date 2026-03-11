import { computed, Injectable, signal } from '@angular/core';
import { minutesToTime, time_functions_utils } from '../utils/time_functions_utils';
import type { UserGroup, ArtistPerformanceSlot, ProgramState} from '../program-types';
import { AllMockArtists } from '../utils/mockDATAS';

/*
TODO: - refacto fonction update des slots
 */

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

  mode= signal<'manual' | 'assisted'>('manual');

  // SELECTORS
  /**
   * exposed program state as a readonly computed signal. This allows other components and services to access the current state of the program without directly modifying it, ensuring that all changes to the state are made through controlled methods provided by the service. By using a computed signal, we can also derive additional data or perform calculations based on the program state, while keeping the original state immutable and consistent throughout the application.
    * @returns ProgramState
   */
  readonly program = computed(() => this.state());

  /**
   * Exposed method to update the program state. This method takes an updater function as an argument, which receives the current state and returns a new state object with the desired changes. By using this approach, we ensure that all updates to the program state are performed in a controlled and predictable manner, while maintaining immutability of the state object.
   * @param updater
   */
  updateState(
    updater: (state: ProgramState) => ProgramState
  ) {
    this.state.update(updater);
  };

  staff = computed(() => this.state().artists);
  rooms = computed(() => this.state().rooms);
  userGroups = signal<UserGroup[]>([]);

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
  };

  changeEndTime(time: string) {

    this.state.update(state => ({
      ...state,
      endTime: time
    }));
  };

  changeProgramMode(newMode: 'manual' | 'assisted') {
    this.mode.set(newMode);
  };

  /**
   * Returns an array of performance slots that are scheduled in a specific room, identified by the provided roomId. The method filters the array of slots in the program state and returns only those slots that have a roomId property matching the given roomId. This allows for retrieving all performance slots associated with a particular room in the program.
   * @param roomId
   */
  getSlotsForRoom(roomId: string) {
    return this.state().slots.filter(s => s.roomId === roomId);
  }

  getSlotStartTime(slot: ArtistPerformanceSlot): string {
    const programStartMinutes = time_functions_utils(this.state().startTime);
    const absolute = programStartMinutes + slot.startMinutes;
    return minutesToTime(absolute);
  };

  getSlotEndTime(slot: ArtistPerformanceSlot): string {
    const programStartMinutes = time_functions_utils(this.state().startTime);
    const absolute =
      programStartMinutes + slot.startMinutes + slot.duration;
    return minutesToTime(absolute);
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
