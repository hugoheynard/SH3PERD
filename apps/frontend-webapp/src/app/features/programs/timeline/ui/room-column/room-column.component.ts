import { Component, inject, input, output } from '@angular/core';
import type { Room } from '../../../program-types';
import { DndDropZoneDirective } from '../../../../../core/drag-and-drop/dnd-drop-zone.directive';
import { RoomService } from '../../../services/mutations-layer/room.service';
import type { DragState } from '../../../../../core/drag-and-drop/drag.types';
import { PlannerResolutionService } from '../../../services/planner-resolution.service';
import { RoomLayoutDirective } from '../../../services/room-layout-directive.directive';
import { TimelineInteractionStore } from '../../../services/timeline-interactions-engine/timeline-interaction.store';
import { TimelineSpatialService } from '../../../services/timeline-spatial.service';
import { RoomInsertLayerComponent } from '../room-insert-layer/room-insert-layer.component';

@Component({
  selector: 'ui-room-column',
  imports: [
    DndDropZoneDirective,
    RoomLayoutDirective,
    RoomInsertLayerComponent,
  ],
  templateUrl: './room-column.component.html',
  styleUrl: './room-column.component.scss'
})
export class RoomColumnComponent {

  res = inject(PlannerResolutionService);
  private interactionStore = inject(TimelineInteractionStore);
  public roomServ = inject(RoomService);
  private spatial = inject(TimelineSpatialService);

  /* -----------------------I/O ---------------- */

  room = input.required<Room>();
  timelineHeight = input.required<number>();
  gridOffsetPx = input.required<number>();
  roomDrop = output<{ room_id: string; drag: DragState, offsetY: number }>();


  /* ---------------------- STATE ---------------- */

  hoveredRoom = this.interactionStore.hoveredRoomId;


  /* -------------------- HANDLERS ---------------- */

  handleRoomDrop(drag: DragState) {

    const projection = this.spatial.projectPointer();

    if (!projection) {
      return;
    }

    this.roomDrop.emit({
      room_id: projection.room_id,
      drag,
      offsetY: this.res.minuteToPx(projection.minutes)
    });
  }
}
