import { inject, Injectable } from '@angular/core';
import { DragPreviewRegistryService } from '../../../core/drag-and-drop/drag-preview-registry.service';
import {
  mapMusicTrackInputs,
  MusicTrackDragPreviewComponent,
} from '../components/music-track-drag-preview/music-track-drag-preview.component';
import type { PlaylistTrackDragPayload } from '../../../core/drag-and-drop/drag.types';

/**
 * Registers the playlist-feature drag previews with the global registry
 * on first instantiation. Mirrors `PlannerDndInitService`: any consumer
 * that uses a music-track or playlist-track drag source injects this
 * service in its constructor to guarantee the preview is wired up
 * before the first drag session starts.
 *
 * `providedIn: 'root'` so the registration runs exactly once per app
 * lifetime, regardless of how many drag sources mount it.
 */
@Injectable({ providedIn: 'root' })
export class PlaylistsDndInitService {
  private registry = inject(DragPreviewRegistryService);

  constructor() {
    // Incoming drags from the music library — drop onto a playlist to
    // add the version as a new track.
    this.registry.register('music-track', {
      component: MusicTrackDragPreviewComponent,
      mapInputs: mapMusicTrackInputs,
    });

    // Internal reorder inside a playlist. Reuses the same compact chip
    // preview (identical title + artist inputs) so the user sees a
    // consistent visual whether they're adding or reshuffling.
    this.registry.register('playlist-track', {
      component: MusicTrackDragPreviewComponent,
      mapInputs: (data: PlaylistTrackDragPayload) => ({
        title: data.title,
        artist: data.artist,
      }),
    });
  }
}
