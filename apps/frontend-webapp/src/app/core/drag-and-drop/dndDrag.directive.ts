import { Directive, ElementRef, HostListener, inject, Input } from '@angular/core';
import { DragSessionService } from './drag-session.service';
import type { DragPayloadMap, DragState } from './drag.types';


@Directive({
  selector: '[dndDrag]',
  standalone: true
})
export class DndDragDirective<K extends keyof DragPayloadMap = keyof DragPayloadMap> {

  private drag = inject(DragSessionService);
  private el = inject(ElementRef<HTMLElement>);

  @Input('dndDrag') data!: DragPayloadMap[K];
  @Input() dndType!: K;

  private startDrag<K extends keyof DragPayloadMap>(
    type: K,
    data: DragPayloadMap[K]
  ) {
    this.drag.start({ type, data } as DragState);
  }

  @HostListener('pointerdown', ['$event'])
  onPointerDown(event: PointerEvent) {

    if (event.button !== 0) return;

    this.el.nativeElement.setPointerCapture(event.pointerId);

    this.startDrag(this.dndType, this.data);

  }

  @HostListener('pointerup')
  onPointerUp() {
    this.drag.stop();
  }

}
