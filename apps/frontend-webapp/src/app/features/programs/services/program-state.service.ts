import { computed, Injectable, signal } from '@angular/core';
import type { ProgramState} from '../program-types';
import { AllMockArtists, mockArtistGroups, mockBuffers } from '../utils/mockDATAS';

//TODO : UNDO/REDO
//TODO : DOC COMPONENT
@Injectable({ providedIn: 'root' })
export class ProgramStateService {

  private state = signal<ProgramState>({
    name: this.defaultProgramName,
    mode: 'manual',
    startTime: '12:00',
    endTime: '19:00',
    rooms: [
      { id: 'r1', name: 'Terrasse' },
      { id: 'r2', name: 'LPC' }
    ],
    slots: [],
    artists: AllMockArtists,
    userGroups: mockArtistGroups,
    timelineOffsets: [...mockBuffers]
  });

  private past: ProgramState[] = [];
  private future: ProgramState[] = [];


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

  hydrateProgram(program: ProgramState) {
    this.state.set(program)
  };

  // -------- GETTERS --------
  /** Generates a default program name based on the current date, formatted as "Program DD-MM-YYYY". */
  get defaultProgramName(): string {
    const date = new Date();

    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();

    return `Program ${day}-${month}-${year}`;
  };


 /* ---------------------------------------------------
    UNDO / REDO
    TODO: Limit history size
  ----------------------------------------*/


  undo() {
    const previous = this.past.pop();

    if (!previous) {
      return;
    }

    const current = this.state();
    this.future.push(current);

    this.state.set(previous);
  };

  redo() {

    const next = this.future.pop();

    if (!next) {
      return;
    }

    const current = this.state();
    this.past.push(current);
    this.state.set(next);
  };
}


