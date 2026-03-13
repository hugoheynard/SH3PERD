import { inject, Injectable } from '@angular/core';
import { ProgramStateService } from '../program-state.service';

@Injectable({ providedIn: 'root' })
export class BufferService {

  private state = inject(ProgramStateService)

  /**
   * Adds a buffer to the program timeline, which shifts all subsequent performances in the same room by the specified delta.
   * @param roomId
   * @param atMinutes
   * @param delta
   */
  addBuffer(roomId: string, atMinutes: number, delta: number) {

    this.state.updateState(state => ({

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
