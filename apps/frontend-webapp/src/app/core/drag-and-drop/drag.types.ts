import { Type } from '@angular/core';
import type {
  ArtistPerformanceSlot,
  ArtistPerformanceSlotTemplate,
  PlannerArtist,
  TimelineCue,
  UserGroup,
} from '../../features/programs/program-types';
import type {
  MultiSlotDragPayload,
} from '../../features/programs/slot-multi-drag-preview/slot-multi-drag-preview.component';


/* ---------------------------------------------------
   DRAG STATE TYPE
--------------------------------------------------- */

export type DragState = {
  [K in DragType]: {
    type: K;
    data: DragPayloadMap[K];
    preview?: Type<any>;
  }
}[DragType]
  | { type: 'resize'; data: ResizeTarget };


/**
 * Defines the structure of the drag state for different types of draggable items in the application.
 * Each type of draggable item (template, artist, group, slot, resize) has its own specific data structure, which is captured in the DragPayloadMap.
 * The DragState type is a discriminated union that allows for type-safe handling of different drag operations based on the 'type' property.
 */
export type TabDragPayload = { tabId: string; title: string };

export type DragPayloadMap = {
  template: ArtistPerformanceSlotTemplate
  artist: PlannerArtist
  group: UserGroup
  slot: ArtistPerformanceSlot
  'slot-multi': MultiSlotDragPayload
  resize: ArtistPerformanceSlot,
  cue: TimelineCue,
  tab: TabDragPayload,
};


export type DragType = keyof DragPayloadMap;

export type ResizeTarget = {
  id: string;
  roomId: string;
  startMinutes: number;
  duration: number;
  type: ResizeTargetType;
};

export enum ResizeTargetType {
  SLOT = 'slot',
  BUFFER = 'buffer',
}
