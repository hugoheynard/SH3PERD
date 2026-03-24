import { Directive, HostListener, output } from '@angular/core';

@Directive({
  selector: '[uiResizeHandle]',
  standalone: true
})
export class ResizeHandleDirective {

  resizeStart = output<PointerEvent>();

  @HostListener('pointerdown', ['$event'])
  onPointerDown(event: PointerEvent) {
    event.stopPropagation();
    this.resizeStart.emit(event);
  }
}
