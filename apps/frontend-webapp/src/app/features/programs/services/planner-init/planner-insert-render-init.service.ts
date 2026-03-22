import { inject, Injectable } from '@angular/core';
import { InsertRenderRegistry } from '../../timeline/insert-interaction-system/InsertElementRenderRegistry';
import { SlotService } from '../mutations-layer/slot.service';
import { CueService } from '../mutations-layer/cue.service';
import { BufferService } from '../mutations-layer/buffer.service';
import { InsertActionType } from '../../timeline/insert-interaction-system/actions-services/insert-action.types';
import { SlotPlannerComponent } from '../../timeline/elements/slot-planner/slot-planner.component';
import { TimelineCueComponent } from '../../timeline/elements/timeline-cue/timeline-cue.component';
import { BufferSlotComponent } from '../../timeline/elements/bufferblock/buffer-slot.component';


@Injectable({ providedIn: 'root' })
export class PlannerInsertRenderInitService {

  private registry = inject(InsertRenderRegistry);
  private slot = inject(SlotService);
  private cue = inject(CueService);
  private buffer = inject(BufferService);

  constructor() {
    this.register();
  }

  private register() {

    this.registry.register(InsertActionType.SLOT, {
      component: SlotPlannerComponent,

      createGhost: ({ minutes, roomId }) =>
        this.slot.createDefault({
          id: 'ghost',
          startMinutes: minutes,
          roomId
        }),

      mapInputs: (slot) => ({
        slot
      })
    });

    this.registry.register(InsertActionType.CUE, {
      component: TimelineCueComponent,

      createGhost: ({ minutes, roomId }) =>
        this.cue.createDefault({
          id: 'ghost',
          minutes,
          roomId
        }),

      mapInputs: (cue) => ({
        cue
      })
    });

    this.registry.register(InsertActionType.BUFFER, {
      component: BufferSlotComponent,

      createGhost: ({ minutes, roomId }) =>
        this.buffer.createDefault({
          id: 'ghost',
          atMinutes: minutes,
          roomId,
          delta: 5
        }),

      mapInputs: (buffer) => ({
        buffer
      })
    });
  }
}
