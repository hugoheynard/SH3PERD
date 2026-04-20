import { inject, Injectable } from '@angular/core';
import { DragPreviewRegistryService } from '../../../core/drag-and-drop/drag-preview-registry.service';
import { PlaylistsDndInitService } from '../../playlists/services/playlists-dnd-init.service';
import {
  mapPlaylistInputs,
  PlaylistDragPreviewComponent,
} from '../../playlists/components/playlist-drag-preview/playlist-drag-preview.component';

/**
 * Registers the drag previews the Shows feature relies on. Mirrors
 * `PlaylistsDndInitService`: any component that mounts a show section
 * drop zone injects this service in its constructor so the previews
 * are wired up before the first drag session starts.
 *
 * Shows accept two drop types:
 * - `'music-track'` — already registered by `PlaylistsDndInitService`.
 *   We piggy-back on that registration by injecting the playlists init
 *   service here; the dual registration is idempotent (registry keeps
 *   the last wins) but this keeps the dependency explicit.
 * - `'playlist'` — registered here via `PlaylistDragPreviewComponent`,
 *   the compact chip showing name + color stripe + track count.
 *
 * `providedIn: 'root'` → runs exactly once per app lifetime.
 */
@Injectable({ providedIn: 'root' })
export class ShowsDndInitService {
  private registry = inject(DragPreviewRegistryService);

  constructor() {
    // Ensure the music-track preview is registered (cross-feature reuse).
    inject(PlaylistsDndInitService);

    this.registry.register('playlist', {
      component: PlaylistDragPreviewComponent,
      mapInputs: mapPlaylistInputs,
    });
  }
}
