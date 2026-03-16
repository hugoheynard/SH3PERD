import { Component, computed, type ElementRef, inject, input, output, ViewChild } from '@angular/core';
import type { Room } from '../program-types';
import { DndDropZoneDirective } from '../../../core/drag-and-drop/dnd-drop-zone.directive';
import { RoomService } from '../services/planner-state-mutations/room.service';
import type { DragState } from '../../../core/drag-and-drop/drag.types';
import { DragSessionService } from '../../../core/drag-and-drop/drag-session.service';
import { InsertLineService } from '../services/insert-line.service';
import { InsertLineComponent } from '../insert-line/insert-line.component';
import { PlannerResolutionService } from '../services/planner-resolution.service';

@Component({
  selector: 'ui-room-column',
  imports: [
    DndDropZoneDirective,
    InsertLineComponent,
  ],
  templateUrl: './room-column.component.html',
  styleUrl: './room-column.component.scss'
})
export class RoomColumnComponent {

  roomServ = inject(RoomService);
  drag = inject(DragSessionService);

  room = input.required<Room>();
  timelineHeight = input.required<number>();
  gridOffsetPx = input.required<number>();

  roomDrop = output<{ roomId: string; drag: DragState, offsetY: number }>();

  @ViewChild('roomLayer', { static: true })
  layer!: ElementRef<HTMLDivElement>;

  handleRoomDrop(drag: DragState) {

    const rect = this.layer.nativeElement.getBoundingClientRect();

    const offsetY = this.drag.cursorY() - rect.top;

    this.roomDrop.emit({
      roomId: this.room().id,
      drag,
      offsetY
    });
  };

  /* ------------------------------
              INSERT LINE
  ---------------------------------- */
  insert = inject(InsertLineService);
  res = inject(PlannerResolutionService);

  showInsertLine = computed(() => {

    const minutes = this.insert.minutes();

    if (minutes === null) {
      return false;
    }

    if (this.insert.multiRoom()) {
      return true;
    }

    return this.insert.roomId() === this.room().id;
  });


  insertTopPx = computed(() => {
    const minutes = this.insert.minutes();
    return minutes === null
      ? null
      : this.res.minuteToPx(minutes);
  });
}
