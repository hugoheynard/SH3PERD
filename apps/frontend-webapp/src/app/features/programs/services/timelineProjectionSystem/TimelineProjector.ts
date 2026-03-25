import { InjectionToken } from '@angular/core';


export interface TimelineProjector {
  project(min: number, roomId?: string): number;
  unproject(min: number, roomId?: string): number;
}


export const TIMELINE_PROJECTOR = new InjectionToken<TimelineProjector>(
  'TIMELINE_PROJECTOR'
);
