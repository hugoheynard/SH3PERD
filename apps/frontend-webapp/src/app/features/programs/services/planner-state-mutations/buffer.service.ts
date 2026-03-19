import { inject, Injectable } from '@angular/core';
import { ProgramHistoryService } from '../program-history.service';

@Injectable({ providedIn: 'root' })
export class BufferService {

  private history = inject(ProgramHistoryService);


  /**
   * Adds a buffer to the program timeline, which shifts all subsequent performances in the same room by the specified delta.
   * @param roomId
   * @param atMinutes
   * @param delta
   */
  addBuffer(roomId: string, atMinutes: number, delta: number) {

    this.history.updateState(state => ({

      ...state,

      timelineOffsets: [
        ...state.timelineOffsets,
        {
          id: crypto.randomUUID(),
          roomId,
          atMinutes,
          delta
        }
      ]
    }));
  };
}
