import {
  Directive,
  ElementRef,
  EventEmitter,
  HostListener,
  Input,
  Output,
  inject
} from '@angular/core';

import { DragSessionService } from './drag-session.service';
import type { DragPayloadMap, DragState } from './drag.types';

@Directive({
  selector: '[uiDndDrag]',
  standalone: true
})
export class DndDragDirective {
  //TODO : gere le conflit avec resize handle
  private drag = inject(DragSessionService);
  private el = inject(ElementRef<HTMLElement>);

  @Input() dndData!: DragPayloadMap[keyof DragPayloadMap];
  @Input() dndType!: keyof DragPayloadMap;

  @Output() dragStart = new EventEmitter<PointerEvent>();

  private pointerId: number | null = null;
  private startX = 0;
  private startY = 0;
  private dragging = false;

  private readonly DRAG_THRESHOLD = 4;

  /* ---------------- POINTER DOWN ---------------- */

  @HostListener('pointerdown', ['$event'])
  onPointerDown(event: PointerEvent) {

    if (event.button !== 0) return;

    this.pointerId = event.pointerId;
    this.startX = event.clientX;
    this.startY = event.clientY;
    this.dragging = false;

    this.el.nativeElement.setPointerCapture(event.pointerId);
  }

  /* ---------------- POINTER MOVE ---------------- */

  @HostListener('pointermove', ['$event'])
  onPointerMove(event: PointerEvent) {

    if (event.pointerId !== this.pointerId) return;

    const dx = event.clientX - this.startX;
    const dy = event.clientY - this.startY;

    const distance = Math.sqrt(dx * dx + dy * dy);

    // seuil non atteint
    if (!this.dragging && distance < this.DRAG_THRESHOLD) return;

    // démarrage du drag
    if (!this.dragging) {

      this.dragging = true;

      const drag: DragState = {
        type: this.dndType,
        data: this.dndData as any
      };

      this.drag.start(drag);

      this.dragStart.emit(event);
      this.drag.updatePointer(event);
      return;
    }

    this.drag.updatePointer(event);
  }

  /* ---------------- POINTER UP ---------------- */

  @HostListener('pointerup', ['$event'])
  onPointerUp(event: PointerEvent) {

    if (event.pointerId !== this.pointerId) return;

    this.releasePointer(event);
  };

  /* ---------------- POINTER CANCEL ---------------- */

  @HostListener('pointercancel', ['$event'])
  onPointerCancel(event: PointerEvent) {

    if (event.pointerId !== this.pointerId) return;

    this.releasePointer(event);
  }

  /* ---------------- HELPERS ---------------- */

  private releasePointer(event: PointerEvent) {

    try {
      this.el.nativeElement.releasePointerCapture(event.pointerId);
    } catch {}

    this.pointerId = null;
    this.dragging = false;
  }

}
