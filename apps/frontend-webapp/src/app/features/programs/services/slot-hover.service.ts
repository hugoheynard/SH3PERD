import { Injectable, signal } from '@angular/core';

import type { ArtistPerformanceSlot } from '../program-types';

@Injectable({
  providedIn: 'root'
})
export class SlotHoverService {
  private _hovered = signal<ArtistPerformanceSlot | null>(null);

  hovered() {
    return this._hovered();
  }

  set(slot: ArtistPerformanceSlot | null) {
    this._hovered.set(slot);
  }

  clear() {
    this._hovered.set(null);
  }

  isHovering(): boolean {
    return this._hovered() !== null;
  }
}
