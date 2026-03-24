import { inject, Injectable } from '@angular/core';
import { DragSessionService } from '../../../../core/drag-and-drop/drag-session.service';
import { PlannerSelectorService } from '../selector-layer/planner-selector.service';
import { CueSelectionService } from './element-selection/cue-selection.service';
import { TimelineInteractionStore } from './timeline-interaction.store';
import { RoomLayoutRegistry } from '../room-layout-registry.service';
import { PlannerResolutionService } from '../planner-resolution.service';
import { TimelineSpatialService } from '../timeline-spatial.service';
import type { TimelineCue } from '../../program-types';

type TCueDragInteraction = {
  grabOffset: number;
  cues: { cue_id: string; offsetMinutes: number }[];
};

@Injectable({ providedIn: 'root' })
export class CueDragInteractionService {

  private drag = inject(DragSessionService);
  private selector = inject(PlannerSelectorService);
  private selection = inject(CueSelectionService);
  private store = inject(TimelineInteractionStore);
  private layout = inject(RoomLayoutRegistry);
  private res = inject(PlannerResolutionService);
  private spatial = inject(TimelineSpatialService);

  private interaction: TCueDragInteraction | null = null;

  start(event: PointerEvent, cue: TimelineCue) {
    this.drag.updatePointer(event);
    this.drag.start({ type: 'cue', data: cue });

    const grabOffset = this.computeGrabOffset(event, cue);
    const cuesById = this.selector.cuesById();
    const selectedIds = this.selection.getSelectedIds();
    const allIds = selectedIds.includes(cue.id) ? selectedIds : [cue.id];

    const cues = allIds.map(id => ({
      cue_id: id,
      offsetMinutes: (cuesById.get(id)?.atMinutes ?? cue.atMinutes) - cue.atMinutes
    }));

    this.store.startCues(
      cues.map(c => ({
        cue_id: c.cue_id,
        previewAtMinutes: cuesById.get(c.cue_id)?.atMinutes ?? cue.atMinutes,
        previewRoomId: cuesById.get(c.cue_id)?.roomId ?? cue.roomId
      }))
    );

    this.interaction = { grabOffset, cues };
  }

  move() {
    if (!this.interaction) return;

    const projection = this.spatial.projectPointer(this.interaction.grabOffset);
    if (!projection) return;

    const previews = this.interaction.cues.map(c => ({
      cue_id: c.cue_id,
      previewAtMinutes: Math.max(0, projection.minutes + c.offsetMinutes),
      previewRoomId: projection.room_id
    }));

    this.store.updateCues(previews);
  }

  private computeGrabOffset(event: PointerEvent, cue: TimelineCue): number {
    const rect = this.layout.getRect(cue.roomId);
    if (!rect) return 0;
    const cuePx = this.res.minuteToPx(cue.atMinutes);
    return event.clientY - (rect.top + cuePx);
  }

  isActive() {
    return !!this.interaction;
  }

  stop() {
    this.interaction = null;
  }
}
