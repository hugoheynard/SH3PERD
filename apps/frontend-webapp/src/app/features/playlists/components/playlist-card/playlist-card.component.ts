import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  output,
} from '@angular/core';
import { IconComponent } from '../../../../shared/icon/icon.component';
import { formatDuration } from '../../../../shared/utils/duration.utils';
import {
  RATING_DOTS,
  ratingLevel,
} from '../../../../shared/utils/rating.utils';
import type { TPlaylistSummaryViewModel } from '../../playlist-types';

/**
 * Visual card for one playlist in the search-mode grid.
 *
 * Renders every field the user asked to see on the card:
 * - name + description
 * - track count + total duration (mm:ss)
 * - mean ratings on the four axes (mastery / energy / effort / quality)
 *   as dots + numeric value, or '—' when the mean is `null` (no data).
 *
 * The card is fully controlled — parent passes the summary in, listens
 * for `open` (click anywhere) and `more` (right-side menu button). The
 * card itself never mutates state.
 */
@Component({
  selector: 'app-playlist-card',
  standalone: true,
  imports: [IconComponent],
  templateUrl: './playlist-card.component.html',
  styleUrl: './playlist-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlaylistCardComponent {
  readonly playlist = input.required<TPlaylistSummaryViewModel>();

  readonly open = output<string>();
  readonly more = output<string>();

  readonly ratingDots = RATING_DOTS;
  readonly ratingLevel = ratingLevel;

  /** Rounded integer representation of a mean — used to decide how many
   *  dots to fill. `null` means means no dots lit at all. */
  integerFromMean(mean: number | null): number {
    if (mean === null) return 0;
    // Round to nearest, clamped to the 1–4 scale the dots render.
    return Math.max(1, Math.min(4, Math.round(mean)));
  }

  /** Display text for a mean in the footer chip (one decimal). */
  displayMean(mean: number | null): string {
    if (mean === null) return '—';
    return mean.toFixed(1);
  }

  readonly duration = computed(() =>
    formatDuration(this.playlist().totalDurationSeconds),
  );

  onClick(): void {
    this.open.emit(this.playlist().id);
  }

  onKey(event: KeyboardEvent): void {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      this.open.emit(this.playlist().id);
    }
  }

  onMoreClick(event: MouseEvent): void {
    event.stopPropagation();
    this.more.emit(this.playlist().id);
  }
}
