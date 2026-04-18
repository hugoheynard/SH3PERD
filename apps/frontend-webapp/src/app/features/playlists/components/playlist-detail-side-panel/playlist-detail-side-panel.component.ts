import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';
import { INJECTION_DATA } from '../../../../core/main-layout/main-layout.component';
import { LayoutService } from '../../../../core/services/layout.service';
import { IconComponent } from '../../../../shared/icon/icon.component';
import { PlaylistDetailComponent } from '../playlist-detail/playlist-detail.component';
import type { TPlaylistId } from '@sh3pherd/shared-types';

/**
 * Right-panel host for `<app-playlist-detail>`.
 *
 * The layout service's `setRightPanel` contract expects a component
 * that reads its config via the `INJECTION_DATA` token. This thin
 * wrapper adapts that token into the playlist detail's
 * `input.required<TPlaylistId | null>` so the same view renders
 * either full-page (inside the playlists page) or docked (from any
 * route — the intended entry point while the user navigates to
 * Music Library and drags tracks back over).
 */
export interface PlaylistDetailSidePanelConfig {
  playlistId: TPlaylistId;
}

@Component({
  selector: 'app-playlist-detail-side-panel',
  standalone: true,
  imports: [IconComponent, PlaylistDetailComponent],
  templateUrl: './playlist-detail-side-panel.component.html',
  styleUrl: './playlist-detail-side-panel.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlaylistDetailSidePanelComponent {
  private readonly layout = inject(LayoutService);
  private readonly config =
    inject<PlaylistDetailSidePanelConfig>(INJECTION_DATA);

  /**
   * Source-of-truth for the currently viewed playlist. Exposed as a
   * signal so future "open in full view" actions or id-swapping
   * affordances can push a new value without recreating the panel.
   */
  readonly playlistId = signal<TPlaylistId | null>(this.config.playlistId);

  close(): void {
    this.layout.clearRightPanel();
  }
}
