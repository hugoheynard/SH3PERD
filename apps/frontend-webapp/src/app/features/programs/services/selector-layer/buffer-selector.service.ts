import { computed, inject, Injectable } from '@angular/core';
import { ProgramStateService } from '../program-state.service';
import type { TimelineBuffer } from '../../program-types';

@Injectable({
  providedIn: 'root'
})
export class BufferSelectorService {
  private state = inject(ProgramStateService);

  buffers = computed(() => this.state.program().timelineOffsets);

  buffersByRoom = computed(() => {
    const map = new Map<string, TimelineBuffer[]>();

    for (const buffer of this.buffers()) {

      const arr = map.get(buffer.room_id) ?? [];

      arr.push(buffer);

      map.set(buffer.room_id, arr);
    }

    return map;
  });

  getBufferForRoom = (room_id: string) => {
    return this.buffersByRoom().get(room_id) ?? [];
  }
}
