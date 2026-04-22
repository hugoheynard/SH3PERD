import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
} from '@angular/core';
import { DatePipe } from '@angular/common';
import type { TShowSectionViewModel } from '@sh3pherd/shared-types';
import { IconComponent } from '../../../shared/icon/icon.component';
import { RatingRowComponent } from '../../../shared/music-analytics/rating-row/rating-row.component';
import { ShowDetailStateService } from '../show-detail/show-detail-state.service';

/**
 * Section footer — meta chips (track count, scheduled start, last
 * played) + compact 4-axis rating row. Pure presentation; the rating
 * groups (with criterion + out-of-range tint) are built from the
 * facade's `buildRatingRow` so shows and sections share the same
 * criterion logic.
 */
@Component({
  selector: 'app-show-section-footer',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DatePipe, IconComponent, RatingRowComponent],
  templateUrl: './show-section-footer.component.html',
  styleUrl: './show-section-footer.component.scss',
})
export class ShowSectionFooterComponent {
  readonly section = input.required<TShowSectionViewModel>();

  private readonly detailState = inject(ShowDetailStateService);

  protected readonly ratingGroups = (): ReturnType<
    ShowDetailStateService['buildRatingRow']
  > => this.detailState.buildRatingRow(this.section());

  protected readonly scheduleLabel = (
    startAt: number | undefined,
  ): string | null => this.detailState.scheduleLabel(startAt);
}
