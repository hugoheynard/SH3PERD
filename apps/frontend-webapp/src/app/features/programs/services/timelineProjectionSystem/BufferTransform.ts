import { inject, Injectable } from '@angular/core';
import type { TimelineHook } from './TimelineProjectionService';
import { ProgramStateService } from '../program-state.service';

@Injectable({ providedIn: 'root' })
export class BufferTransform implements TimelineHook {

  private state = inject(ProgramStateService);

  private getBuffers() {
    return this.state.program().timelineOffsets;
  }

  project(min: number, roomId?: string): number {
    const allBuffers = this.getBuffers();
    const buffers = allBuffers
      .filter(b => !roomId || b.room_id === roomId);

    const offset = buffers
      .filter(b => b.atMinutes <= min)
      .reduce((acc, b) => acc + b.delta, 0);

    return min + offset;
  }

  unproject(min: number, roomId?: string): number {
    const buffers = this.getBuffers()
      .filter(b => !roomId || b.room_id === roomId);

    let offset = 0;

    for (const b of buffers) {
      if (min >= b.atMinutes + offset) {
        offset += b.delta;
      }
    }

    return min - offset;
  }
}
