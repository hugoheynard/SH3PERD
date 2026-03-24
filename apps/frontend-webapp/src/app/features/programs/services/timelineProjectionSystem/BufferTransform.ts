import { Injectable } from '@angular/core';
import type { TimelineHook } from './TimelineProjectionService';
import type { ProgramStateService } from '../program-state.service';

@Injectable()
export class BufferTransform implements TimelineHook {

  constructor(private state: ProgramStateService) {}

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
