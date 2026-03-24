import { inject, Injectable } from '@angular/core';
import type { TimelineHook } from './TimelineProjectionService';
import { ProgramStateService } from '../program-state.service';

@Injectable({ providedIn: 'root' })
export class BufferTransform implements TimelineHook {

  private state = inject(ProgramStateService);

  private getBuffers() {
    return this.state.program().timelineOffsets;
  }

  project(min: number): number {
    const buffers = this.getBuffers();

    const offset = buffers
      .filter(b => b.atMinutes <= min)
      .reduce((acc, b) => acc + b.delta, 0);

    return min + offset;
  }

  unproject(min: number): number {
    const buffers = this.getBuffers();

    let offset = 0;

    for (const b of buffers) {
      if (min >= b.atMinutes + offset) {
        offset += b.delta;
      }
    }

    return min - offset;
  }
}
