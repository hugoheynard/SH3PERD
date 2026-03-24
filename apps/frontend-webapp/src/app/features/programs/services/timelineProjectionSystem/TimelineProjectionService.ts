import { Injectable } from '@angular/core';
import type { TimelineProjector } from './TimelineProjector';

/**
 * time modifier
 */
export interface TimelineHook {
  project(min: number): number;
  unproject(min: number): number;
}

@Injectable({ providedIn: 'root' })
export class TimelineProjectionService implements TimelineProjector {

  private hooks: TimelineHook[] = [];

  registerHook(hook: TimelineHook) {
    this.hooks.push(hook);
  };

  project(min: number): number {
    return this.hooks.reduce(
      (acc, hook) => hook.project(acc),
      min
    );
  };

  unproject(min: number): number {
    return [...this.hooks]
      .reverse()
      .reduce((acc, hook) => hook.unproject(acc), min);
  };
}
