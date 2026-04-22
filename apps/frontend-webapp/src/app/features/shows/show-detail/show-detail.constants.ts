import type {
  TShowAxisKey,
  TShowSectionViewModel,
  TShowSummaryViewModel,
} from '@sh3pherd/shared-types';

export const SHOW_DETAIL_RATING_AXES = [
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
] as const satisfies readonly {
  label: string;
  axisKey: TShowAxisKey;
  accent: string;
  meanKey: keyof TShowSummaryViewModel & keyof TShowSectionViewModel;
  seriesKey: keyof TShowSummaryViewModel & keyof TShowSectionViewModel;
}[];

export type ShowDetailRatingAxis = (typeof SHOW_DETAIL_RATING_AXES)[number];
