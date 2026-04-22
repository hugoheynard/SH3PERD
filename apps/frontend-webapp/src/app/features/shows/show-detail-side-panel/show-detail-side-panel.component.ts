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
import {
  CrossPageNavComponent,
  type CrossPageNavLink,
} from '../../../shared/cross-page-nav/cross-page-nav.component';
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

const SHOW_NAV_LINKS: CrossPageNavLink[] = [
  { icon: 'music', label: 'Music library', url: '/app/musicLibrary' },
  { icon: 'play', label: 'Playlists', url: '/app/playlistManager' },
];

@Component({
  selector: 'app-show-detail-side-panel',
  standalone: true,
  imports: [IconComponent, ShowDetailComponent, CrossPageNavComponent],
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

  /** Captured at mount-time — the URL the user was on when they opened
   *  this panel. Drives the back button in the cross-page-nav cluster
   *  so one click returns them there regardless of where they've
   *  hopped to since. */
  readonly originUrl = signal(this.router.url);

  readonly navLinks = SHOW_NAV_LINKS;

  close(): void {
    this.layout.clearRightPanel();
  }

  openFullPage(): void {
    const id = this.showId();
    if (!id) return;
    this.router.navigate(['/app/shows', id]);
    this.layout.clearRightPanel();
  }
}
