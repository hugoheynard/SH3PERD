import { Directive, HostListener, inject, Input } from '@angular/core';
import { DragSessionService } from './drag-session.service';

@Directive({
  selector: '[uiDndDrop]'
})
export class DndDropDirective {

  private drag = inject(DragSessionService);

  @Input() dndDrop!: string;

  @HostListener('pointerenter')
  onEnter() {
    this.drag.setDropTarget(this.dndDrop);
  }

  @HostListener('pointerleave')
  onLeave() {
    this.drag.clearDropTarget();
  }


}
