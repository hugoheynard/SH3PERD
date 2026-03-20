import { inject, Injectable } from '@angular/core';
import type { Room } from '../../program-types';
import { PlannerSelectorService } from '../selector-layer/planner-selector.service';
import { ProgramHistoryService } from '../program-history.service';

@Injectable({ providedIn: 'root' })
export class RoomService {

  private history = inject(ProgramHistoryService);
  private selector = inject(PlannerSelectorService);

  /* ---------------------------------
  ROOM HANDLING
 ---------------------------------- */
  /**
   * Adds a new room to the program state. The method generates a unique identifier for the new room using the crypto.randomUUID() function and assigns it a default name of "New Room". The new room is then added to the existing array of rooms in the program state, allowing for dynamic expansion of the available rooms in the program.
   */
  addRoom() {

    const id = crypto.randomUUID();

    this.history.updateState(state => ({

      ...state,

      rooms: [
        ...state.rooms,
        {
          id,
          name: 'New Room'
        }
      ]

    }));
  };

  /**
   * Removes a room from the program state. If the room being removed is the default room (the first one in the list), it will not be deleted to ensure there is always at least one room available. Additionally, all performance slots associated with the removed room will also be deleted from the state.
   * @param roomId
   */
  removeRoom(roomId: string) {

    this.history.updateState(state => {

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

  isBaseRoom(room: Room): boolean {
    return this.selector.rooms()[0]?.id === room.id;
  };
}
