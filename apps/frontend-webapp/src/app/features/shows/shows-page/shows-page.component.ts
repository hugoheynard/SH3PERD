import {
  ChangeDetectionStrategy,
  Component,
  inject,
  type OnInit,
} from '@angular/core';
import { DatePipe } from '@angular/common';
import type { TShowId, TShowSummaryViewModel } from '@sh3pherd/shared-types';
import { LayoutService } from '../../../core/services/layout.service';
import { ShowsStateService } from '../services/shows-state.service';
import { ShowsMutationService } from '../services/shows-mutation.service';
import { ButtonComponent } from '../../../shared/button/button.component';
import { ButtonIconComponent } from '../../../shared/button-icon/button-icon.component';
import { EmptyStateComponent } from '../../../shared/empty-state/empty-state.component';
import { IconComponent } from '../../../shared/icon/icon.component';
import { InlineConfirmComponent } from '../../../shared/inline-confirm/inline-confirm.component';
import { LoadingStateComponent } from '../../../shared/loading-state/loading-state.component';
import { RatingSparklineComponent } from '../../../shared/rating-sparkline/rating-sparkline.component';
import { ShowDetailSidePanelComponent } from '../show-detail-side-panel/show-detail-side-panel.component';

/** Four rating axes rendered on every show card — mirrors the playlist
 *  card layout so the two sibling features stay visually coherent. The
 *  accent colours are pulled from the rating colour scale (low/medium/
 *  high/max) so a show card reads identically to a playlist card. */
const RATING_AXES = [
  {
    label: 'MST',
    accent: 'var(--color-rating-high, #4ade80)',
    meanKey: 'meanMastery',
    seriesKey: 'masterySeries',
  },
  {
    label: 'NRG',
    accent: 'var(--color-rating-max, #fbbf24)',
    meanKey: 'meanEnergy',
    seriesKey: 'energySeries',
  },
  {
    label: 'EFF',
    accent: 'var(--color-rating-medium, #38bdf8)',
    meanKey: 'meanEffort',
    seriesKey: 'effortSeries',
  },
  {
    label: 'QTY',
    accent: 'var(--color-rating-low, #a78bfa)',
    meanKey: 'meanQuality',
    seriesKey: 'qualitySeries',
  },
] as const;

type RatingAxis = (typeof RATING_AXES)[number];

@Component({
  selector: 'app-shows-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    DatePipe,
    ButtonComponent,
    ButtonIconComponent,
    EmptyStateComponent,
    IconComponent,
    InlineConfirmComponent,
    LoadingStateComponent,
    RatingSparklineComponent,
  ],
  templateUrl: './shows-page.component.html',
  styleUrl: './shows-page.component.scss',
})
export class ShowsPageComponent implements OnInit {
  protected readonly state = inject(ShowsStateService);
  private readonly mutations = inject(ShowsMutationService);
  private readonly layout = inject(LayoutService);

  protected readonly axes = RATING_AXES;

  ngOnInit(): void {
    this.state.loadSummaries();
  }

  onCreate(): void {
    const name = window.prompt('Show name')?.trim();
    if (!name) return;
    this.mutations.createShow({ name, color: 'indigo' });
  }

  /** Card click → open the show in the docked side panel. The main
   *  area stays scrollable so the user can switch to Music Library /
   *  Playlists and drag tracks over. */
  onOpenShow(show: TShowSummaryViewModel): void {
    this.layout.setRightPanel(ShowDetailSidePanelComponent, {
      showId: show.id,
    });
  }

  onDuplicate(show: TShowSummaryViewModel): void {
    this.mutations.duplicateShow(show.id);
  }

  onDelete(show: TShowSummaryViewModel): void {
    this.mutations.deleteShow(show.id);
  }

  trackById(_: number, s: { id: TShowId }): TShowId {
    return s.id;
  }

  meanFor(show: TShowSummaryViewModel, axis: RatingAxis): number | null {
    return show[axis.meanKey];
  }

  seriesFor(show: TShowSummaryViewModel, axis: RatingAxis): (number | null)[] {
    return show[axis.seriesKey];
  }

  displayMean(mean: number | null): string {
    return mean === null ? '—' : mean.toFixed(1);
  }

  formatDuration(seconds: number): string {
    const m = Math.round(seconds / 60);
    if (m < 60) return `${m} min`;
    const h = Math.floor(m / 60);
    const rm = m % 60;
    return rm === 0 ? `${h}h` : `${h}h ${rm}m`;
  }
}
