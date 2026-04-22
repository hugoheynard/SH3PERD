import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from '@angular/core';
import { IconComponent } from '../../../../shared/icon/icon.component';
import { formatDuration } from '../../../../shared/utils/duration.utils';
import {
  ratingLevel,
  RATING_DOTS,
} from '../../../../shared/utils/rating.utils';
import type {
  TPlaylistDetailViewModel,
  TPlaylistSummaryViewModel,
} from '../../playlist-types';

@Component({
  selector: 'app-playlist-header',
  standalone: true,
  imports: [IconComponent],
  templateUrl: './playlist-header.component.html',
  styleUrl: './playlist-header.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlaylistHeaderComponent {
  readonly playlist = input.required<TPlaylistDetailViewModel>();
  readonly summary = input<TPlaylistSummaryViewModel | null>(null);

  readonly ratingDots = RATING_DOTS;
  readonly totalDuration = computed(() =>
    formatDuration(this.summary()?.totalDurationSeconds ?? 0),
  );

  integerFromMean(mean: number | null): number {
    if (mean === null) return 0;
    return Math.max(1, Math.min(4, Math.round(mean)));
  }

  displayMean(mean: number | null): string {
    return mean === null ? '—' : mean.toFixed(1);
  }

  readonly ratingLevel = ratingLevel;
}
