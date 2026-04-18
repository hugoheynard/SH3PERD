import { inject, Injectable } from '@angular/core';
import { DragPreviewRegistryService } from '../../../core/drag-and-drop/drag-preview-registry.service';
import {
  mapMusicTrackInputs,
  MusicTrackDragPreviewComponent,
} from '../components/music-track-drag-preview/music-track-drag-preview.component';

/**
 * Registers the `music-track` drag preview with the global registry on
 * first instantiation. Mirrors the `PlannerDndInitService` pattern used
 * by the programs feature: any consumer that uses a music-track drag
 * source simply injects this service in its constructor to guarantee
 * the preview is wired up before the first drag session starts.
 *
 * `providedIn: 'root'` so the registration runs exactly once per app
 * lifetime, regardless of how many drag sources mount it.
 */
@Injectable({ providedIn: 'root' })
export class PlaylistsDndInitService {
  private registry = inject(DragPreviewRegistryService);

  constructor() {
    this.registry.register('music-track', {
      component: MusicTrackDragPreviewComponent,
      mapInputs: mapMusicTrackInputs,
    });
  }
}
