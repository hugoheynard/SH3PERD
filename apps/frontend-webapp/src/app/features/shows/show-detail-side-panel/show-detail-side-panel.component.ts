import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';
import { Router } from '@angular/router';
import { INJECTION_DATA } from '../../../core/main-layout/main-layout.component';
import { LayoutService } from '../../../core/services/layout.service';
import { IconComponent } from '../../../shared/icon/icon.component';
import { ShowDetailComponent } from '../show-detail/show-detail.component';
import type { TShowId } from '@sh3pherd/shared-types';

/**
 * Right-panel host for the show detail. Opened via
 * `LayoutService.setRightPanel(ShowDetailSidePanelComponent, { showId })`
 * so the side panel stays docked while the user navigates to music
 * library or playlists to drag sources into the show's sections.
 */
export interface ShowDetailSidePanelConfig {
  showId: TShowId;
}

@Component({
  selector: 'app-show-detail-side-panel',
  standalone: true,
  imports: [IconComponent, ShowDetailComponent],
  templateUrl: './show-detail-side-panel.component.html',
  styleUrl: './show-detail-side-panel.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ShowDetailSidePanelComponent {
  private readonly layout = inject(LayoutService);
  private readonly router = inject(Router);
  private readonly config = inject<ShowDetailSidePanelConfig>(INJECTION_DATA);

  /** Swappable source-of-truth so the panel survives id-swaps without remount. */
  readonly showId = signal<TShowId | null>(this.config.showId);

  close(): void {
    this.layout.clearRightPanel();
  }

  openFullPage(): void {
    const id = this.showId();
    if (!id) return;
    this.router.navigate(['/app/shows', id]);
    this.layout.clearRightPanel();
  }

  openMusicLibrary(): void {
    this.router.navigate(['/app/musicLibrary']);
  }

  openPlaylists(): void {
    this.router.navigate(['/app/playlistManager']);
  }
}
