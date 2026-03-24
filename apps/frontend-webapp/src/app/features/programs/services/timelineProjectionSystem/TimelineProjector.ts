import { InjectionToken } from '@angular/core';


export interface TimelineProjector {
  project(min: number): number;
  unproject(min: number): number;
}


export const TIMELINE_PROJECTOR = new InjectionToken<TimelineProjector>(
  'TIMELINE_PROJECTOR'
);
