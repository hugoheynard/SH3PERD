import { Injectable } from '@angular/core';
import type { DragState, DragType } from './drag.types';



interface DropZone<K extends DragType = DragType> {
  el: HTMLElement;
  id: unknown;
  accept: K[];
  onDrop: (drag: Extract<DragState, { type: K }>) => void;
}

@Injectable({ providedIn: 'root' })
export class DropZoneRegistryService {

  private zones = new Map<HTMLElement, DropZone>();
  private zonesById = new Map<unknown, DropZone>();

  register(zone: DropZone) {
    this.zones.set(zone.el, zone);
    this.zonesById.set(zone.id, zone);
  }

  unregister(el: HTMLElement) {
    const zone = this.zones.get(el);

    if (zone) {
      this.zonesById.delete(zone.id);
    }

    this.zones.delete(el);
  };

  findZone(x: number, y: number, dragType: DragType): DropZone | null {

    const elements = document.elementsFromPoint(x, y);

    for (const el of elements) {

      let current: HTMLElement | null = el as HTMLElement;

      while (current) {

        const zone = this.zones.get(current);

        if (zone && zone.accept.includes(dragType)) {
          return zone;
        }

        current = current.parentElement;
      }
    }

    return null;
  }



  emitDrop(targetId: unknown, drag: DragState) {

    const zone = this.zonesById.get(targetId);

    if (zone) {
      zone.onDrop(drag);
    }
  }

}
