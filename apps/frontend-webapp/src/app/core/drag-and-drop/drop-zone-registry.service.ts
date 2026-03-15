import { Injectable } from '@angular/core';
import type { DragState } from './drag.types';

interface DropZone {
  el: HTMLElement;
  id: unknown;
  accept: string[];
  onDrop: (drag: DragState) => void;
}

@Injectable({ providedIn: 'root' })
export class DropZoneRegistryService {

  private zones = new Map<HTMLElement, DropZone>();

  register(zone: DropZone) {
    this.zones.set(zone.el, zone);
  }

  unregister(el: HTMLElement) {
    this.zones.delete(el);
  }

  findZone(x: number, y: number, dragType: string): DropZone | null {

    const elements = document.elementsFromPoint(x, y);

    for (const el of elements) {

      const zone = this.findZoneFromElement(el, dragType);

      if (zone) return zone;
    }

    return null;
  }

  private findZoneFromElement(el: Element, dragType: string): DropZone | null {

    let current: HTMLElement | null = el as HTMLElement;

    while (current) {

      const zone = this.zones.get(current);

      if (zone && zone.accept.includes(dragType)) {
        return zone;
      }

      current = current.parentElement;
    }

    return null;
  }

  emitDrop(targetId: unknown, drag: DragState) {

    for (const zone of this.zones.values()) {

      if (zone.id === targetId) {
        zone.onDrop(drag);
        return;
      }

    }
  }

}
