import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  output,
} from '@angular/core';
import { IconComponent } from '../../../../shared/icon/icon.component';
import { formatDuration } from '../../../../shared/utils/duration.utils';
import { buildRatingGroups } from '../../../../shared/music-analytics/rating-axes';
import { RatingRowComponent } from '../../../../shared/music-analytics/rating-row/rating-row.component';
import { DndDragDirective } from '../../../../core/drag-and-drop/dndDrag.directive';
import type { PlaylistDragPayload } from '../../../../core/drag-and-drop/drag.types';
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
  imports: [IconComponent, RatingRowComponent, DndDragDirective],
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

  /** 4-axis descriptor list pre-built from the current summary. */
  readonly ratingGroups = computed(() => buildRatingGroups(this.playlist()));

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
