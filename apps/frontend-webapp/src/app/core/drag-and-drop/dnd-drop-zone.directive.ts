import { Directive, ElementRef, EventEmitter, inject, Input, type OnDestroy, type OnInit, Output } from '@angular/core';
import { DropZoneRegistryService } from './drop-zone-registry.service';
import type { DragState } from './drag.types';

@Directive({
  selector: '[uiDndDropZone]',
  standalone: true
})
export class DndDropZoneDirective implements OnInit, OnDestroy {

  private el = inject(ElementRef<HTMLElement>);
  private registry = inject(DropZoneRegistryService);

  @Input() dropZone_id!: unknown;
  @Input() dropZoneAccept!: string | string[];

  @Output() uiDndDrop = new EventEmitter<DragState>();

  ngOnInit() {

    this.registry.register({
      el: this.el.nativeElement,
      id: this.dropZone_id,
      accept: Array.isArray(this.dropZoneAccept)
        ? this.dropZoneAccept
        : [this.dropZoneAccept],
      onDrop: drag => this.uiDndDrop.emit(drag)
    });

  }

  ngOnDestroy() {
    this.registry.unregister(this.el.nativeElement);
  }

}
