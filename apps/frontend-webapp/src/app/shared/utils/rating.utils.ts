/**
 * Shared rating utilities.
 *
 * The music library uses a 1-4 rating scale for mastery, energy,
 * effort, and audio quality. These helpers are used across 6+
 * components in the music feature and are reusable by any feature
 * that adopts the same scale (playlists, programs, etc.).
 */

/** The four rating values as a readonly tuple — used in templates for dot rendering. */
export const RATING_DOTS = [1, 2, 3, 4] as const;

/** Rating level label for conditional styling via `[attr.data-level]`. */
export type TRatingLevel = 'low' | 'medium' | 'high' | 'max';

/**
 * Maps a 1-4 rating to a semantic level string.
 * Used as `[attr.data-level]="ratingLevel(r)"` in templates so SCSS
 * can target each level with `[data-level='high'] { color: ... }`.
 */
export function ratingLevel(rating: number): TRatingLevel {
  if (rating <= 1) return 'low';
  if (rating === 2) return 'medium';
  if (rating === 3) return 'high';
  return 'max';
}
