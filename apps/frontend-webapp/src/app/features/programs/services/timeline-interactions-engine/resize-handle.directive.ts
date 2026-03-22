/*
import {
  Directive,
  ElementRef,
  HostListener,
  inject,
  input,
} from '@angular/core';
import { DragSessionService } from '../../../../core/drag-and-drop/drag-session.service';
import type { DragState } from '../../../../core/drag-and-drop/drag.types';


@Directive({
  selector: '[uiResizeHandle]',
  standalone: true
})
export class ResizeHandleDirective {

  private el = inject(ElementRef<HTMLElement>);
  private drag = inject(DragSessionService);

  block = input.required<{ id: string; startMinutes: number; duration: number }>();

  private pointerId: number | null = null;



  @HostListener('pointerdown', ['$event'])
  onPointerDown(event: PointerEvent) {

    event.stopPropagation(); // 🔥 bloque le drag

    this.pointerId = event.pointerId;
    this.el.nativeElement.setPointerCapture(event.pointerId);

    const drag: DragState = {
      type: 'resize',
      data: this.block()
    };

    this.drag.start(drag);
    this.drag.updatePointer(event);
  }



  @HostListener('pointermove', ['$event'])
  onPointerMove(event: PointerEvent) {

    if (event.pointerId !== this.pointerId) {
      return;
    }

    this.drag.updatePointer(event);
  }



  @HostListener('pointerup', ['$event'])
  onPointerUp(event: PointerEvent) {

    if (event.pointerId !== this.pointerId) return;

    this.release(event);
  }

  private release(event: PointerEvent) {
    try {
      this.el.nativeElement.releasePointerCapture(event.pointerId);
    } catch {}

    this.pointerId = null;
  }
}
*/
