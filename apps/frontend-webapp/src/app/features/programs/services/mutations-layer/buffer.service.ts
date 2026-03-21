import { Injectable } from '@angular/core';
import { BaseTimelineItemCRUD } from './BaseTimelineItemCRUD';
import type { TimelineBuffer } from '../../program-types';

@Injectable({ providedIn: 'root' })
export class BufferService
  extends BaseTimelineItemCRUD<'timelineOffsets'>{

  constructor() {
    super('timelineOffsets')
  }

  createDefault(p: TimelineBuffer & { overrides?: Partial<TimelineBuffer> }
  ): TimelineBuffer {
    return {
      id: p.id,
      atMinutes: p.atMinutes,
      delta: p.delta,
      roomId: p.roomId,
      ...p.overrides
    }
  }
}
