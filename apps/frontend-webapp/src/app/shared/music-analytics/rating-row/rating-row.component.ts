import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RatingSparklineComponent } from '../../rating-sparkline/rating-sparkline.component';

export type RatingRowVariant = 'regular' | 'compact' | 'card';
export type RatingRowBackground = 'surface' | 'transparent';

/**
 * One rendered axis within a {@link RatingRowComponent}.
 *
 * Caller pre-computes the row so the shared component stays agnostic
 * of the source shape (show summary vs. playlist summary vs. section
 * view-model). Criterion + out-of-range are show-only concerns; other
 * features just pass `undefined`.
 */
export interface RatingRowGroup {
  /** 3-letter chip label ("MST", "NRG", "EFF", "QTY"). */
  label: string;
  /** Sparkline accent colour (CSS token). */
  accent: string;
  /** Numeric mean or `null` when no data — triggers the "empty" style. */
  mean: number | null;
  /** Per-item series driving the sparkline. */
  series: (number | null)[];
  /** Optional criterion chip label (e.g. "≥ 3", "2.5–4"). */
  criterion?: string | null;
  /** Tints value + chip in the alert colour when the mean drifts out. */
  outOfRange?: boolean;
}

/**
 * Shared 4-axis rating row used by Shows (header + section footer +
 * shows-page card) and Playlists (card). Replaces three feature-local
 * copies of the same DOM/SCSS.
 *
 * The row renders the `groups` array as-is — it does not look up axis
 * keys, it does not know about view models. Callers feed it a
 * RatingRowGroup list built from their own data + {@link RATING_AXES}.
 */
@Component({
  selector: 'app-rating-row',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RatingSparklineComponent],
  templateUrl: './rating-row.component.html',
  styleUrl: './rating-row.component.scss',
  host: {
    '[attr.data-variant]': 'variant()',
    '[attr.data-background]': 'background()',
    '[attr.aria-label]': 'ariaLabel()',
    role: 'group',
  },
})
export class RatingRowComponent {
  readonly groups = input.required<readonly RatingRowGroup[]>();

  /** Layout + sparkline sizing. `regular` is the full show-header look,
   *  `compact` shrinks the sparkline + criterion chip for dense footers,
   *  `card` stretches the axes to `1fr` each for card grids. */
  readonly variant = input<RatingRowVariant>('regular');

  /** `surface` adds a subtle bg + border + padding. `transparent` lets
   *  the row sit flush against its parent (card body, section footer). */
  readonly background = input<RatingRowBackground>('transparent');

  /** Optional per-item duration weights — forwarded to the sparkline so
   *  long tracks visually dominate short ones. */
  readonly durations = input<number[] | null>(null);

  readonly ariaLabel = input('Rating shape + mean');

  displayMean(mean: number | null): string {
    return mean === null ? '—' : mean.toFixed(1);
  }
}
