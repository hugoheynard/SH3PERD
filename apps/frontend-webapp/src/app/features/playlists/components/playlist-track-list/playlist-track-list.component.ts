import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from '@angular/core';
import { IconComponent } from '../../../../shared/icon/icon.component';
import { DndDropZoneDirective } from '../../../../core/drag-and-drop/dnd-drop-zone.directive';
import { DndDragDirective } from '../../../../core/drag-and-drop/dndDrag.directive';
import type {
  DragState,
  PlaylistTrackDragPayload,
} from '../../../../core/drag-and-drop/drag.types';
import type { TPlaylistDetailViewModel } from '../../playlist-types';
import {
  DropzoneListContainerComponent,
  type DropzoneListDropEvent,
} from '../../../../shared/dropzone-list-container/dropzone-list-container.component';
import type { TPlaylistTrackId } from '@sh3pherd/shared-types';
import { SortableRowFrameComponent } from '../../../../shared/sortable-row-frame/sortable-row-frame.component';

@Component({
  selector: 'app-playlist-track-list',
  standalone: true,
  imports: [
    IconComponent,
    DndDropZoneDirective,
    DndDragDirective,
    DropzoneListContainerComponent,
    SortableRowFrameComponent,
  ],
  templateUrl: './playlist-track-list.component.html',
  styleUrl: './playlist-track-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlaylistTrackListComponent {
  readonly playlistId = input.required<string>();
  readonly tracks = input.required<TPlaylistDetailViewModel['tracks']>();

  readonly dropped =
    output<DropzoneListDropEvent<TPlaylistDetailViewModel['tracks'][number]>>();
  readonly emptyDropped = output<DragState>();
  readonly removeTrack = output<string>();

  dragPayloadFor(track: {
    id: string;
    title: string;
    originalArtist: string;
  }): PlaylistTrackDragPayload {
    return {
      playlistTrackId: track.id as TPlaylistTrackId,
      title: track.title,
      artist: track.originalArtist,
    };
  }

  trackById = (track: { id: string }): string => track.id;

  dragTrackId(drag: DragState): string | null {
    return drag.type === 'playlist-track' ? drag.data.playlistTrackId : null;
  }
}
