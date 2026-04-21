import type {
  TMusicVersionDomainModel,
  TShowRatingSeries,
  TVersionTrackDomainModel,
} from '@sh3pherd/shared-types';

/**
 * Build the rating sparkline contract (meanX + xSeries per axis) for a
 * list of music versions, in whatever input order the caller passes.
 *
 * Follows the same convention the playlist query handler uses:
 * - one entry per version, `null` marks "no data on that axis"
 * - mean is `null` when the series has no numeric data
 * - `totalDurationSeconds` sums the favorite track's duration (the take
 *   the artist considers canonical for this version), with a fallback
 *   to self-reported duration on each track.
 *
 * Used for both `TShowSummaryViewModel` (whole show, passed the full
 * flattened version list) and `TShowSectionViewModel` (section-only).
 */
export function computeRatingSeries(
  versions: readonly TMusicVersionDomainModel[],
): TShowRatingSeries {
  const masterySeries: (number | null)[] = [];
  const energySeries: (number | null)[] = [];
  const effortSeries: (number | null)[] = [];
  const qualitySeries: (number | null)[] = [];
  const durationSeries: number[] = [];
  let totalDurationSeconds = 0;

  for (const version of versions) {
    masterySeries.push(version.mastery ?? null);
    energySeries.push(version.energy ?? null);
    effortSeries.push(version.effort ?? null);

    const favorite = pickFavoriteTrack(version.tracks);
    if (!favorite) {
      qualitySeries.push(null);
      durationSeries.push(0);
      continue;
    }
    const duration = resolveTrackDuration(favorite);
    durationSeries.push(duration);
    totalDurationSeconds += duration;
    qualitySeries.push(favorite.analysisResult?.quality ?? null);
  }

  return {
    trackCount: versions.length,
    totalDurationSeconds,
    meanMastery: meanOfSeries(masterySeries),
    meanEnergy: meanOfSeries(energySeries),
    meanEffort: meanOfSeries(effortSeries),
    meanQuality: meanOfSeries(qualitySeries),
    masterySeries,
    energySeries,
    effortSeries,
    qualitySeries,
    durationSeries,
  };
}

function pickFavoriteTrack(tracks: TVersionTrackDomainModel[]): TVersionTrackDomainModel | null {
  if (tracks.length === 0) return null;
  return tracks.find((t) => t.favorite) ?? tracks[0] ?? null;
}

function resolveTrackDuration(track: TVersionTrackDomainModel): number {
  return track.analysisResult?.durationSeconds ?? track.durationSeconds ?? 0;
}

function meanOfSeries(series: (number | null)[]): number | null {
  const values = series.filter((v): v is number => v !== null);
  if (values.length === 0) return null;
  return values.reduce((a, b) => a + b, 0) / values.length;
}
