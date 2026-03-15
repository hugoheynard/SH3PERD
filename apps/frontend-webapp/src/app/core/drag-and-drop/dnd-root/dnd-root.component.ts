import { Component, HostListener, inject } from '@angular/core';
import { DragSessionService } from '../drag-session.service';
import { DragEngineService } from '../drag-engine.service';

@Component({
  selector: 'ui-dnd-root',
  imports: [],
  templateUrl: './dnd-root.component.html',
  styleUrl: './dnd-root.component.scss'
})
export class DndRootComponent {

  private drag = inject(DragSessionService);
  private engine = inject(DragEngineService);

  @HostListener('document:pointermove', ['$event'])
  onPointerMove(event: PointerEvent) {

    if (!this.drag.isDragging()) {
      return;
    }

    this.drag.updatePointer(event);
    this.engine.onPointerMove(event);
  }

  @HostListener('document:pointerup', ['$event'])
  onPointerUp() {

    if (!this.drag.isDragging()) {
      return;
    }

    this.engine.onPointerUp();
  }

}
