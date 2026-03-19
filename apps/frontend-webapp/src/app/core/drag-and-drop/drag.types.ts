import { Type } from '@angular/core';
import type {
  ArtistPerformanceSlot,
  ArtistPerformanceSlotTemplate,
  PlannerArtist,
  UserGroup,
} from '../../features/programs/program-types';
import type {
  MultiSlotDragPayload,
} from '../../features/programs/multi-slot-drag-preview/multi-slot-drag-preview.component';


/* ---------------------------------------------------
   DRAG STATE TYPE
--------------------------------------------------- */

export type DragState = {
  [K in keyof DragPayloadMap]: {
    type: K;
    data: DragPayloadMap[K];
    preview?: Type<any>;
  }
}[keyof DragPayloadMap];


/**
 * Defines the structure of the drag state for different types of draggable items in the application.
 * Each type of draggable item (template, artist, group, slot, resize) has its own specific data structure, which is captured in the DragPayloadMap.
 * The DragState type is a discriminated union that allows for type-safe handling of different drag operations based on the 'type' property.
 */
export type DragPayloadMap = {
  template: ArtistPerformanceSlotTemplate
  artist: PlannerArtist
  group: UserGroup
  slot: ArtistPerformanceSlot
  'slot-multi': MultiSlotDragPayload
  resize: ArtistPerformanceSlot
};
