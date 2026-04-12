/**
 * Shared duration formatting utilities.
 *
 * Two flavours:
 * - `formatDuration` — for display in tables/cards. Returns '—' for
 *   missing values, rounds to nearest second.
 * - `formatTime` — for the audio player timeline. Returns '0:00' for
 *   invalid values, floors to current second (no rounding — important
 *   for a live playback counter).
 */

/** Format a duration in seconds for static display (tables, cards). */
export function formatDuration(seconds?: number): string {
  if (!seconds) return '—';
  const total = Math.round(seconds);
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

/** Format a time position in seconds for the audio player timeline. */
export function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return '0:00';
  const total = Math.floor(seconds);
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}
