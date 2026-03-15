import { inject, Injectable } from '@angular/core';
import { DragSessionService } from './drag-session.service';
import { DropZoneRegistryService } from './drop-zone-registry.service';

@Injectable({
  providedIn: 'root'
})
export class DragEngineService {

  private drag = inject(DragSessionService);
  private registry = inject(DropZoneRegistryService);

  onPointerMove(event: PointerEvent) {

    const drag = this.drag.current();
    if (!drag) return;

    const zone = this.registry.findZone(
      event.clientX,
      event.clientY,
      drag.type
    );

    if (!zone) {
      this.drag.clearDropTarget();
      return;
    }

    // éviter des updates inutiles
    const current = this.drag.getDropTarget();

    if (current !== zone.id) {
      this.drag.setDropTarget(zone.id);
    }
  }

  onPointerUp() {

    const drag = this.drag.current();
    if (!drag) return;

    const target = this.drag.getDropTarget();

    if (target !== null) {
      this.registry.emitDrop(target, drag);
    }

    this.drag.stop();
  }

}
