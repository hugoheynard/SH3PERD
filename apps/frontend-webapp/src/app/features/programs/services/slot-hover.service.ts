import { Injectable, signal } from '@angular/core';
import type { PerformanceSlot } from './program-state.service';

@Injectable({
  providedIn: 'root'
})
export class SlotHoverService {
  private _hovered = signal<PerformanceSlot | null>(null);

  hovered() {
    return this._hovered();
  }

  set(slot: PerformanceSlot | null) {
    this._hovered.set(slot);
  }

  clear() {
    this._hovered.set(null);
  }

  isHovering(): boolean {
    return this._hovered() !== null;
  }
}
