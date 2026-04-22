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
import { ShowMutationService } from '../services/mutations-layer/show-mutation.service';
import { ButtonComponent } from '../../../shared/button/button.component';
import { ButtonIconComponent } from '../../../shared/button-icon/button-icon.component';
import { EmptyStateComponent } from '../../../shared/empty-state/empty-state.component';
import { IconComponent } from '../../../shared/icon/icon.component';
import { InlineConfirmComponent } from '../../../shared/inline-confirm/inline-confirm.component';
import { LoadingStateComponent } from '../../../shared/loading-state/loading-state.component';
import { RatingSparklineComponent } from '../../../shared/rating-sparkline/rating-sparkline.component';
import { ShowDetailSidePanelComponent } from '../show-detail-side-panel/show-detail-side-panel.component';
import { NewShowPopoverComponent } from '../new-show-popover/new-show-popover.component';
import {
  RATING_AXES,
  type RatingAxisDescriptor,
} from '../../../shared/music-analytics/rating-axes';

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
  private readonly mutations = inject(ShowMutationService);
  private readonly layout = inject(LayoutService);

  protected readonly axes = RATING_AXES;

  ngOnInit(): void {
    this.state.loadSummaries();
  }

  onCreate(): void {
    this.layout.setPopover(NewShowPopoverComponent);
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

  meanFor(
    show: TShowSummaryViewModel,
    axis: RatingAxisDescriptor,
  ): number | null {
    return show[axis.meanKey];
  }

  seriesFor(
    show: TShowSummaryViewModel,
    axis: RatingAxisDescriptor,
  ): (number | null)[] {
    return show[axis.seriesKey];
  }

  durationsFor(show: TShowSummaryViewModel): number[] {
    return show.durationSeries;
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
