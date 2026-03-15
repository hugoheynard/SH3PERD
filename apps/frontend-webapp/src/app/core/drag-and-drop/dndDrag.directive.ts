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

  private pointerId: number | null = null;

  /* ---------------- START DRAG ---------------- */


  private startDrag<K extends keyof DragPayloadMap>(
    type: K,
    data: DragPayloadMap[K]
  ) {
    this.drag.start({ type, data } as DragState);
  }

  /* ---------------- POINTER DOWN ---------------- */

  @HostListener('pointerdown', ['$event'])
  onPointerDown(event: PointerEvent) {

    if (event.button !== 0) {
      return;
    }

    const el = this.el.nativeElement;

    this.pointerId = event.pointerId;

    el.setPointerCapture(event.pointerId);
    event.preventDefault();

    this.startDrag(this.dndType, this.data);
  }

  /* ---------------- POINTER MOVE ---------------- */

  @HostListener('pointermove', ['$event'])
  onPointerMove(event: PointerEvent) {

    if (!this.drag.isDragging()) {
      return;
    }

    if (event.pointerId !== this.pointerId) {
      return;
    }

    this.drag.updatePointer(event);
  }

  /* ---------------- POINTER UP ---------------- */


  @HostListener('pointerup', ['$event'])
  onPointerUp(event: PointerEvent) {

    if (event.pointerId !== this.pointerId) {
      return;
    }

    this.releasePointer(event);

    this.drag.stop();
  }


  /* ---------------- POINTER CANCEL ---------------- */

  @HostListener('pointercancel', ['$event'])
  onPointerCancel(event: PointerEvent) {

    if (event.pointerId !== this.pointerId) {
      return;
    }

    this.releasePointer(event);

    this.drag.stop();
  }


  /* ---------------- HELPERS ---------------- */

  private releasePointer(event: PointerEvent) {

    const el = this.el.nativeElement;

    try {
      el.releasePointerCapture(event.pointerId);
    } catch {}

    this.pointerId = null;
  }


}
