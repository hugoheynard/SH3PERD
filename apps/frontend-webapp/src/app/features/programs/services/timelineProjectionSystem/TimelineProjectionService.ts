import { Injectable } from '@angular/core';
import type { TimelineProjector } from './TimelineProjector';

/**
 * time modifier
 */
export interface TimelineHook {
  project(min: number, roomId?: string): number;
  unproject(min: number, roomId?: string): number;
}

@Injectable({ providedIn: 'root' })
export class TimelineProjectionService implements TimelineProjector {

  private hooks: TimelineHook[] = [];

  registerHook(hook: TimelineHook) {
    this.hooks.push(hook);
  };

  project(min: number, roomId?: string): number {
    return this.hooks.reduce(
      (acc, hook) => hook.project(acc, roomId),
      min
    );
  };

  unproject(min: number, roomId?: string): number {
    return [...this.hooks]
      .reverse()
      .reduce((acc, hook) => hook.unproject(acc, roomId), min);
  };
}
