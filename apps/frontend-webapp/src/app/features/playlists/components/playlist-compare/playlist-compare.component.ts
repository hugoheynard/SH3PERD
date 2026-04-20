import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  output,
} from '@angular/core';
import { IconComponent } from '../../../../shared/icon/icon.component';
import { PlaylistsSelectorService } from '../../services/selector-layer/playlists-selector.service';
import { PlaylistCardComponent } from '../playlist-card/playlist-card.component';
import { formatDuration } from '../../../../shared/utils/duration.utils';
import {
  ratingLevel,
  RATING_DOTS,
} from '../../../../shared/utils/rating.utils';
import type { TPlaylistSummaryViewModel } from '../../playlist-types';
import type { TPlaylistId } from '@sh3pherd/shared-types';

interface CompareRow {
  readonly label: string;
  readonly key:
    | 'trackCount'
    | 'totalDuration'
    | 'meanMastery'
    | 'meanEnergy'
    | 'meanEffort'
    | 'meanQuality';
}

/**
 * Compare view — renders 2 or 3 playlists side-by-side in fixed
 * columns so the user can eyeball the differences in length, track
 * count, and mean ratings at a glance.
 *
 * Pulls the summaries straight from the state service (no per-view
 * fetch); the ratings highlight which playlist leads on each axis
 * when every compared playlist has data for it.
 */
@Component({
  selector: 'app-playlist-compare',
  standalone: true,
  imports: [IconComponent, PlaylistCardComponent],
  templateUrl: './playlist-compare.component.html',
  styleUrl: './playlist-compare.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlaylistCompareComponent {
  private readonly selector = inject(PlaylistsSelectorService);

  /** IDs to compare — expected to be 2-3, enforced by the caller. */
  readonly playlistIds = input.required<TPlaylistId[]>();

  /** Emit when the user wants to drop a playlist from the comparison. */
  readonly remove = output<TPlaylistId>();

  /** Emit when the user clicks on one of the columns' card header —
   *  switches the tab back to playlist-detail mode for that id. */
  readonly open = output<string>();

  readonly ratingDots = RATING_DOTS;
  readonly ratingLevel = ratingLevel;

  /** Fixed compare matrix — rows are metrics, columns are playlists. */
  readonly rows: CompareRow[] = [
    { label: 'Tracks', key: 'trackCount' },
    { label: 'Duration', key: 'totalDuration' },
    { label: 'Mastery', key: 'meanMastery' },
    { label: 'Energy', key: 'meanEnergy' },
    { label: 'Effort', key: 'meanEffort' },
    { label: 'Quality', key: 'meanQuality' },
  ];

  /** Resolved summaries in the same order as `playlistIds`. Missing
   *  entries (id not in state) are filtered out to avoid column gaps. */
  readonly summaries = computed((): TPlaylistSummaryViewModel[] => {
    const map = this.selector.playlistsById();
    return this.playlistIds()
      .map((id) => map.get(id))
      .filter((s): s is TPlaylistSummaryViewModel => s !== undefined);
  });

  /** Pre-computed "leader" index per row — highlights the column with
   *  the max value when at least two columns have data. `null` means
   *  either tie, or not enough data to declare a winner. */
  readonly leaderIndexByRow = computed(
    (): Record<CompareRow['key'], number | null> => {
      const sums = this.summaries();
      const keys: CompareRow['key'][] = [
        'trackCount',
        'totalDuration',
        'meanMastery',
        'meanEnergy',
        'meanEffort',
        'meanQuality',
      ];
      const result = {} as Record<CompareRow['key'], number | null>;

      for (const key of keys) {
        const values = sums.map((s) => this.readValue(s, key));
        const withData = values.filter((v) => v !== null) as number[];
        if (withData.length < 2) {
          result[key] = null;
          continue;
        }
        const max = Math.max(...withData);
        // Tie-break: if more than one column ties on the max, no leader.
        if (values.filter((v) => v === max).length > 1) {
          result[key] = null;
        } else {
          result[key] = values.findIndex((v) => v === max);
        }
      }
      return result;
    },
  );

  /** Read a metric off a summary, normalising totalDuration + numeric
   *  counts + nullable means into the same shape. */
  private readValue(
    summary: TPlaylistSummaryViewModel,
    key: CompareRow['key'],
  ): number | null {
    switch (key) {
      case 'trackCount':
        return summary.trackCount;
      case 'totalDuration':
        return summary.totalDurationSeconds;
      case 'meanMastery':
        return summary.meanMastery;
      case 'meanEnergy':
        return summary.meanEnergy;
      case 'meanEffort':
        return summary.meanEffort;
      case 'meanQuality':
        return summary.meanQuality;
    }
  }

  /** Formatted display for a metric cell — duration as mm:ss, counts
   *  as integers, means as one-decimal or dash. */
  displayValue(
    summary: TPlaylistSummaryViewModel,
    key: CompareRow['key'],
  ): string {
    const raw = this.readValue(summary, key);
    if (raw === null) return '—';
    switch (key) {
      case 'trackCount':
        return `${raw}`;
      case 'totalDuration':
        return formatDuration(raw);
      default:
        return raw.toFixed(1);
    }
  }

  isLeader(rowKey: CompareRow['key'], colIndex: number): boolean {
    return this.leaderIndexByRow()[rowKey] === colIndex;
  }

  onRemove(id: TPlaylistId): void {
    this.remove.emit(id);
  }
}
