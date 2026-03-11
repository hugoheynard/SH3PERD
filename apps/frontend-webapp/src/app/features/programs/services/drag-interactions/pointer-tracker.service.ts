import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class PointerTrackerService {
  private activePointerId = signal<number | null>(null);

  /* ------------------ STATE ------------------ */

  readonly pointerId = this.activePointerId.asReadonly();

  isTracking(): boolean {
    return this.activePointerId() !== null;
  };

  /* ------------------ LIFECYCLE ------------------ */

  start(event: PointerEvent): void {
    this.activePointerId.set(event.pointerId);
  };

  isActivePointer(event: PointerEvent): boolean {
    return this.activePointerId() === event.pointerId;
  };

  stop(): void {
    this.activePointerId.set(null);
  };
}
