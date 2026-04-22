/**
 * Canonical rating-axis descriptor shared by Shows, Playlists and any
 * other feature rendering the 4-axis (mastery / energy / effort /
 * quality) rating row.
 *
 * Feature-local duplicates (`SHOW_DETAIL_RATING_AXES`,
 * per-card `RATING_AXES`) used to drift on accent colour or label
 * casing; consolidating here makes visual grammar a single source of
 * truth. Structural keys only — no view-model coupling — so the
 * descriptor works with any summary shape that exposes
 * `mean{Axis}` + `{axis}Series`.
 */

export type RatingAxisKey = 'mastery' | 'energy' | 'effort' | 'quality';

type RatingMeanKey =
  | 'meanMastery'
  | 'meanEnergy'
  | 'meanEffort'
  | 'meanQuality';

type RatingSeriesKey =
  | 'masterySeries'
  | 'energySeries'
  | 'effortSeries'
  | 'qualitySeries';

export interface RatingAxisDescriptor {
  /** 3-letter chip label ("MST", "NRG", …). */
  label: string;
  /** Stable key used for criterion lookups and ARIA. */
  axisKey: RatingAxisKey;
  /** CSS colour (tokenised) used for the sparkline accent. */
  accent: string;
  /** Summary field holding the mean value for this axis. */
  meanKey: RatingMeanKey;
  /** Summary field holding the per-item series for this axis. */
  seriesKey: RatingSeriesKey;
}

export const RATING_AXES: readonly RatingAxisDescriptor[] = [
  {
    label: 'MST',
    axisKey: 'mastery',
    accent: 'var(--color-rating-high, #4ade80)',
    meanKey: 'meanMastery',
    seriesKey: 'masterySeries',
  },
  {
    label: 'NRG',
    axisKey: 'energy',
    accent: 'var(--color-rating-max, #fbbf24)',
    meanKey: 'meanEnergy',
    seriesKey: 'energySeries',
  },
  {
    label: 'EFF',
    axisKey: 'effort',
    accent: 'var(--color-rating-medium, #38bdf8)',
    meanKey: 'meanEffort',
    seriesKey: 'effortSeries',
  },
  {
    label: 'QTY',
    axisKey: 'quality',
    accent: 'var(--color-rating-low, #a78bfa)',
    meanKey: 'meanQuality',
    seriesKey: 'qualitySeries',
  },
] as const;
