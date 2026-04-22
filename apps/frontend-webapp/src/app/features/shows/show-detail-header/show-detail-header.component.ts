import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import type {
  TShowAxisCriterion,
  TShowAxisKey,
  TShowSummaryViewModel,
} from '@sh3pherd/shared-types';
import { ButtonIconComponent } from '../../../shared/button-icon/button-icon.component';
import { IconComponent } from '../../../shared/icon/icon.component';
import { InlineConfirmComponent } from '../../../shared/inline-confirm/inline-confirm.component';
import { RatingSparklineComponent } from '../../../shared/rating-sparkline/rating-sparkline.component';

export type ShowDetailHeaderAxis = {
  label: string;
  axisKey: TShowAxisKey;
  accent: string;
  meanKey: string;
  seriesKey: string;
};

@Component({
  selector: 'app-show-detail-header',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    DatePipe,
    FormsModule,
    ButtonIconComponent,
    IconComponent,
    InlineConfirmComponent,
    RatingSparklineComponent,
  ],
  templateUrl: './show-detail-header.component.html',
  styleUrl: './show-detail-header.component.scss',
})
export class ShowDetailHeaderComponent {
  readonly show = input.required<TShowSummaryViewModel>();
  readonly sectionCount = input.required<number>();
  readonly axes = input.required<readonly ShowDetailHeaderAxis[]>();

  readonly editingShowName = input(false);
  readonly showNameDraft = input('');
  readonly editingShowDescription = input(false);
  readonly showDescriptionDraft = input('');
  readonly editingShowTarget = input(false);
  readonly showTargetMinutesDraft = input('');

  readonly formatDuration = input.required<(seconds: number) => string>();
  readonly scheduleLabel =
    input.required<(startAt: number | undefined) => string | null>();
  readonly showFillState =
    input.required<
      (show: TShowSummaryViewModel) => 'empty' | 'under' | 'near' | 'over'
    >();
  readonly showFillPercent =
    input.required<(show: TShowSummaryViewModel) => string | null>();
  readonly showFillWidth =
    input.required<(show: TShowSummaryViewModel) => string>();
  readonly showTargetSeconds =
    input.required<(show: TShowSummaryViewModel) => number | null>();
  readonly meanFor =
    input.required<
      (show: TShowSummaryViewModel, axis: unknown) => number | null
    >();
  readonly criterionFor =
    input.required<
      (
        show: TShowSummaryViewModel,
        axisKey: TShowAxisKey,
      ) => TShowAxisCriterion | null
    >();
  readonly isMeanOutOfRange =
    input.required<
      (show: TShowSummaryViewModel, axisKey: TShowAxisKey) => boolean
    >();
  readonly criterionLabel =
    input.required<(criterion: TShowAxisCriterion) => string>();
  readonly seriesFor =
    input.required<
      (show: TShowSummaryViewModel, axis: unknown) => (number | null)[]
    >();
  readonly durationsFor =
    input.required<(show: TShowSummaryViewModel) => number[]>();
  readonly displayMean = input.required<(mean: number | null) => string>();

  readonly showNameDraftChange = output<string>();
  readonly showDescriptionDraftChange = output<string>();
  readonly showTargetMinutesDraftChange = output<string>();

  readonly renameShowRequested = output<void>();
  readonly renameShowCommitted = output<void>();
  readonly showNameKeyDown = output<KeyboardEvent>();

  readonly editShowDescriptionRequested = output<void>();
  readonly editShowDescriptionCommitted = output<void>();
  readonly showDescriptionKeyDown = output<KeyboardEvent>();

  readonly editShowTargetRequested = output<void>();
  readonly editShowTargetCommitted = output<void>();
  readonly showTargetKeyDown = output<KeyboardEvent>();

  readonly openSettingsRequested = output<void>();
  readonly markPlayedRequested = output<void>();
  readonly duplicateRequested = output<void>();
  readonly deleteRequested = output<void>();
}
