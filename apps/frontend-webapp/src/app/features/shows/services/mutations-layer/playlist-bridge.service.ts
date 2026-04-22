import { inject, Injectable } from '@angular/core';
import type {
  TPlaylistColor,
  TShowId,
  TShowSectionId,
} from '@sh3pherd/shared-types';
import { ShowsApiService } from '../shows-api.service';

/**
 * Cross-feature bridge between Shows and Playlists.
 *
 * Hosted under the shows feature because it is invoked from the
 * "convert section" popover. Only surfaces actions that cross the
 * Show/Playlist boundary; regular Playlist CRUD stays in the
 * playlists feature.
 */
@Injectable({ providedIn: 'root' })
export class PlaylistBridgeService {
  private readonly api = inject(ShowsApiService);

  convertSectionToPlaylist(
    showId: TShowId,
    sectionId: TShowSectionId,
    payload: { name?: string; color?: TPlaylistColor },
  ): void {
    this.api.convertSectionToPlaylist(showId, sectionId, payload).subscribe();
  }
}
