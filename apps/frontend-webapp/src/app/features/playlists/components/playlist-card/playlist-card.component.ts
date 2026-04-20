import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  output,
} from '@angular/core';
import { IconComponent } from '../../../../shared/icon/icon.component';
import { formatDuration } from '../../../../shared/utils/duration.utils';
import { RatingSparklineComponent } from '../rating-sparkline/rating-sparkline.component';
import { DndDragDirective } from '../../../../core/drag-and-drop/dndDrag.directive';
import type { PlaylistDragPayload } from '../../../../core/drag-and-drop/drag.types';
import type { TPlaylistSummaryViewModel } from '../../playlist-types';

/** The four axes rendered on the card. Each entry references the
 *  corresponding mean + series fields on the summary; the template
 *  iterates this list so every axis stays visually identical. */
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
  imports: [IconComponent, RatingSparklineComponent, DndDragDirective],
  templateUrl: './playlist-card.component.html',
  styleUrl: './playlist-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlaylistCardComponent {
  readonly playlist = input.required<TPlaylistSummaryViewModel>();

  readonly open = output<string>();
  readonly more = output<string>();

  /** Drag payload consumed by the Shows feature's section drop zones.
   *  Kept as a computed so the template binding remains a stable
   *  reference across renders and only re-creates when the card's
   *  summary actually changes. */
  readonly dragPayload = computed<PlaylistDragPayload>(() => {
    const p = this.playlist();
    return {
      playlistId: p.id,
      name: p.name,
      color: p.color,
      trackCount: p.trackCount,
    };
  });

  /** Fixed axis list rendered as a 4-column grid in the footer. */
  readonly axes = RATING_AXES;

  /** Display text for a mean in the axis chip (one decimal, or '—'). */
  displayMean(mean: number | null): string {
    if (mean === null) return '—';
    return mean.toFixed(1);
  }

  /** Type-safe accessors so the template can read a summary field by
   *  the discriminated key on each axis. */
  meanFor(axis: RatingAxis): number | null {
    return this.playlist()[axis.meanKey];
  }

  seriesFor(axis: RatingAxis): (number | null)[] {
    return this.playlist()[axis.seriesKey];
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
