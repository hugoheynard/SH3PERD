import { Injectable } from '@angular/core';

interface DropZone {
  el: HTMLElement;
  id: unknown;
  accept: string[];
}

@Injectable({ providedIn: 'root' })
export class DropZoneRegistryService {

  private zones: DropZone[] = [];

  register(zone: DropZone) {
    this.zones.push(zone);
  }

  unregister(el: HTMLElement) {
    this.zones = this.zones.filter(z => z.el !== el);
  }

  findZone(x: number, y: number, dragType: string): DropZone | null {

    for (const zone of this.zones) {

      const rect = zone.el.getBoundingClientRect();

      if (
        x >= rect.left &&
        x <= rect.right &&
        y >= rect.top &&
        y <= rect.bottom
      ) {

        if (!zone.accept.includes(dragType)) {
          continue;
        }

        return zone;
      }
    }

    return null;
  }
}
