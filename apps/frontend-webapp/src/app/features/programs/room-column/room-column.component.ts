import { Component, computed, inject, input, output } from '@angular/core';
import type { Room } from '../program-types';
import { DndDropZoneDirective } from '../../../core/drag-and-drop/dnd-drop-zone.directive';
import { RoomService } from '../services/planner-state-mutations/room.service';
import type { DragState } from '../../../core/drag-and-drop/drag.types';
import { InsertLineService } from '../services/insert-line.service';
import { InsertLineComponent } from '../insert-line/insert-line.component';
import { PlannerResolutionService } from '../services/planner-resolution.service';
import { RoomLayoutDirective } from '../services/room-layout-directive.directive';
import { TimelineInteractionStore } from '../services/timeline-interactions/timeline-interaction.store';
import { TimelineSpatialService } from '../services/timeline-spatial.service';
import { CueService } from '../services/planner-state-mutations/cue.service';

@Component({
  selector: 'ui-room-column',
  imports: [
    DndDropZoneDirective,
    InsertLineComponent,
    RoomLayoutDirective,
  ],
  templateUrl: './room-column.component.html',
  styleUrl: './room-column.component.scss'
})
export class RoomColumnComponent {

  private res = inject(PlannerResolutionService);
  private interactionStore = inject(TimelineInteractionStore);
  public roomServ = inject(RoomService);
  private spatial = inject(TimelineSpatialService);

  /* -----------------------I/O ---------------- */

  room = input.required<Room>();
  timelineHeight = input.required<number>();
  gridOffsetPx = input.required<number>();
  roomDrop = output<{ roomId: string; drag: DragState, offsetY: number }>();


  /* ---------------------- STATE ---------------- */

  hoveredRoom = this.interactionStore.hoveredRoomId;


  /* -------------------- HANDLERS ---------------- */

  handleRoomDrop(drag: DragState) {

    const projection = this.spatial.projectPointer();

    if (!projection) {
      return;
    }

    this.roomDrop.emit({
      roomId: projection.room_id,
      drag,
      offsetY: this.res.minuteToPx(projection.minutes)
    });
  }

  /* -------------------INSERT LINE ------------------ */

  private insert = inject(InsertLineService);

  indicator = computed(() => {
    const indicator = this.insert.indicator();

    if (!indicator) {
      return null;
    }

    if (indicator.multiRoom) {
      return indicator;
    }

    if (indicator.roomId !== this.room().id) {
      return null;
    }

    return indicator;
  });


  insertTopPx = computed(() => {
    const minutes = this.insert.minutes();
    return minutes === null
      ? null
      : this.res.minuteToPx(minutes);
  });


  isAltMode = this.insert.altMode;

  private cueService = inject(CueService);

  handleInsert() {

    const indicator = this.insert.indicator();
    if (!indicator) {
      return;
    }

    this.cueService.addCue({
      id: crypto.randomUUID(),
      roomId: indicator.roomId,
      atMinutes: indicator.minutes,
      label: 'New cue',
      type: 'default'
    });
  }


}
