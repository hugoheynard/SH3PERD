import type { TShowSectionItemView } from '@sh3pherd/shared-types';

export function showItemTitle(item: TShowSectionItemView): string {
  return item.kind === 'version' ? item.version.title : item.playlist.name;
}

export function showItemSubtitle(item: TShowSectionItemView): string {
  if (item.kind === 'version') {
    return `${item.version.originalArtist} — ${item.version.label}`;
  }

  return `Playlist · ${item.playlist.trackCount} track${item.playlist.trackCount > 1 ? 's' : ''}`;
}

export function showItemDuration(item: TShowSectionItemView): number | null {
  if (item.kind === 'version') {
    const duration = item.version.durationSeconds;
    return typeof duration === 'number' && duration > 0 ? duration : null;
  }

  const duration = item.playlist.totalDurationSeconds;
  return typeof duration === 'number' && duration > 0 ? duration : null;
}

export function showItemDurationLabel(
  item: TShowSectionItemView,
): string | null {
  const duration = showItemDuration(item);
  if (duration === null) return null;

  return item.kind === 'version'
    ? formatTrackDuration(duration)
    : formatMinutesDuration(duration);
}

export function formatMinutesDuration(seconds: number): string {
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${minutes} min`;

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return remainingMinutes === 0
    ? `${hours}h`
    : `${hours}h ${remainingMinutes}m`;
}

function formatTrackDuration(seconds: number): string {
  const total = Math.max(0, Math.round(seconds));
  const minutes = Math.floor(total / 60);
  const remainingSeconds = total % 60;
  return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
}
