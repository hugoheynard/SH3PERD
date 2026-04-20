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
import { ShowDetailSidePanelComponent } from '../show-detail-side-panel/show-detail-side-panel.component';

/** Four rating axes rendered on every show card — mirrors the playlist
 *  card layout so the two sibling features stay visually coherent. */
const RATING_AXES = [
  { label: 'MST', meanKey: 'meanMastery' },
  { label: 'NRG', meanKey: 'meanEnergy' },
  { label: 'EFF', meanKey: 'meanEffort' },
  { label: 'QTY', meanKey: 'meanQuality' },
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

  displayMean(mean: number | null): string {
    return mean === null ? '—' : mean.toFixed(1);
  }

  /** Projects a 1–4 mean onto the rating colour scale used across the
   *  app (low / medium / high / max) so the chip tints match the
   *  music feature's rating semantics. */
  levelFor(mean: number | null): 'low' | 'medium' | 'high' | 'max' | null {
    if (mean === null) return null;
    if (mean < 1.75) return 'low';
    if (mean < 2.5) return 'medium';
    if (mean < 3.5) return 'high';
    return 'max';
  }

  formatDuration(seconds: number): string {
    const m = Math.round(seconds / 60);
    if (m < 60) return `${m} min`;
    const h = Math.floor(m / 60);
    const rm = m % 60;
    return rm === 0 ? `${h}h` : `${h}h ${rm}m`;
  }
}
