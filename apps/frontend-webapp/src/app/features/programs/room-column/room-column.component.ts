import { Component, type ElementRef, inject, input, output, ViewChild } from '@angular/core';
import type { Room } from '../program-types';
import { DndDropZoneDirective } from '../../../core/drag-and-drop/dnd-drop-zone.directive';
import { RoomService } from '../services/planner-state-mutations/room.service';
import type { DragState } from '../../../core/drag-and-drop/drag.types';
import { DragSessionService } from '../../../core/drag-and-drop/drag-session.service';

@Component({
  selector: 'ui-room-column',
  imports: [
    DndDropZoneDirective,
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
}
