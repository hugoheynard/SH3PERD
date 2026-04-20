import { Type } from '@angular/core';
import type {
  ArtistPerformanceSlot,
  ArtistPerformanceSlotTemplate,
  PlannerArtist,
  TimelineCue,
} from '../../features/programs/program-types';
import type { MultiSlotDragPayload } from '../../features/programs/slot-multi-drag-preview/slot-multi-drag-preview.component';
import type {
  TMusicReferenceId,
  TMusicVersionId,
  TOrgNodeHierarchyViewModel,
  TPlaylistColor,
  TPlaylistId,
  TPlaylistTrackId,
  TShowSectionId,
} from '@sh3pherd/shared-types';

/* ---------------------------------------------------
   DRAG STATE TYPE
--------------------------------------------------- */

export type DragState =
  | {
      [K in DragType]: {
        type: K;
        data: DragPayloadMap[K];
        preview?: Type<any>;
      };
    }[DragType]
  | { type: 'resize'; data: ResizeTarget };

/**
 * Defines the structure of the drag state for different types of draggable items in the application.
 * Each type of draggable item (template, artist, slot, resize) has its own specific data structure, which is captured in the DragPayloadMap.
 * The DragState type is a discriminated union that allows for type-safe handling of different drag operations based on the 'type' property.
 */
export type TabDragPayload = { tabId: string; title: string };

/**
 * Payload emitted when a music-library version is dragged. Consumed by
 * the playlist detail's tracklist drop zone to call AddPlaylistTrack
 * with the (referenceId, versionId) pair; title + artist are carried
 * for the drag preview + optimistic view-model.
 */
export type MusicTrackDragPayload = {
  referenceId: TMusicReferenceId;
  versionId: TMusicVersionId;
  title: string;
  artist: string;
};

/**
 * Payload emitted when reordering a row inside a playlist's tracklist.
 * The id identifies the row being moved; title + artist feed the same
 * drag preview used for incoming music-library drags so the visual
 * grammar stays identical between "add" and "reorder".
 */
export type PlaylistTrackDragPayload = {
  playlistTrackId: TPlaylistTrackId;
  title: string;
  artist: string;
};

/**
 * Payload emitted when a whole playlist is dragged from the playlists
 * list grid (or its side panel). Consumed by the show detail's section
 * drop zones to add the playlist as a section item without expanding
 * its tracks — the show's rating series expands recursively at query
 * time instead.
 */
export type PlaylistDragPayload = {
  playlistId: TPlaylistId;
  name: string;
  color: TPlaylistColor;
  trackCount: number;
};

/**
 * Payload emitted when a show section is grabbed for reordering inside
 * the show detail. Consumed by the per-section insertion drop zones,
 * which call `reorderSections()` with the new position.
 */
export type ShowSectionDragPayload = {
  sectionId: TShowSectionId;
  name: string;
};

export type DragPayloadMap = {
  template: ArtistPerformanceSlotTemplate;
  artist: PlannerArtist;
  slot: ArtistPerformanceSlot;
  'slot-multi': MultiSlotDragPayload;
  resize: ArtistPerformanceSlot;
  cue: TimelineCue;
  tab: TabDragPayload;
  'org-node': TOrgNodeHierarchyViewModel;
  'music-track': MusicTrackDragPayload;
  'playlist-track': PlaylistTrackDragPayload;
  playlist: PlaylistDragPayload;
  'show-section': ShowSectionDragPayload;
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
