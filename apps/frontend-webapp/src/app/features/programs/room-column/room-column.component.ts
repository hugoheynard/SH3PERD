import { Component, computed, inject, input, output } from '@angular/core';
import type { Room } from '../program-types';
import { DndDropZoneDirective } from '../../../core/drag-and-drop/dnd-drop-zone.directive';
import { RoomService } from '../services/planner-state-mutations/room.service';
import type { DragState } from '../../../core/drag-and-drop/drag.types';
import { DragSessionService } from '../../../core/drag-and-drop/drag-session.service';
import { InsertLineService } from '../services/insert-line.service';
import { InsertLineComponent } from '../insert-line/insert-line.component';
import { PlannerResolutionService } from '../services/planner-resolution.service';
import { RoomLayoutDirective } from '../services/room-layout-directive.directive';
import { TimelineInteractionStore } from '../services/timeline-interaction.store';
import { RoomLayoutRegistry } from '../services/room-layout-registry.service';

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
  private drag = inject(DragSessionService);
  private interactionStore = inject(TimelineInteractionStore);
  private roomLayout = inject(RoomLayoutRegistry);
  public roomServ = inject(RoomService);


  room = input.required<Room>();
  timelineHeight = input.required<number>();
  gridOffsetPx = input.required<number>();

  hoveredRoom = this.interactionStore.hoveredRoomId;


  roomDrop = output<{ roomId: string; drag: DragState, offsetY: number }>();


  handleRoomDrop(drag: DragState) {

    const rect = this.roomLayout.getRect(this.room().id);

    if (!rect) {
      return;
    }

    const offsetY = this.drag.cursorY() - rect.top;

    this.roomDrop.emit({
      roomId: this.room().id,
      drag,
      offsetY
    });
  }

  /* ------------------------------
              INSERT LINE
  ---------------------------------- */
  insert = inject(InsertLineService);

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
}
