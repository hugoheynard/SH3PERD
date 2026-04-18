// Re-export shared types for convenience within the playlists feature
export type {
  TPlaylistDomainModel as Playlist,
  TPlaylistTrackDomainModel as PlaylistTrack,
  TPlaylistColor as PlaylistColor,
  TPlaylistTrackView as PlaylistTrackView,
  TPlaylistSummaryViewModel,
  TPlaylistDetailViewModel,
  TCreatePlaylistPayload,
  TUpdatePlaylistPayload,
  TAddPlaylistTrackPayload,
  TReorderPlaylistTrackPayload,
} from '@sh3pherd/shared-types';

export { PlaylistColors as PLAYLIST_COLORS } from '@sh3pherd/shared-types';

import type {
  TPlaylistId,
  TPlaylistSummaryViewModel,
  TPlaylistTrackDomainModel,
  TPlaylistColor,
} from '@sh3pherd/shared-types';
import type {
  TabItem,
  SavedTabConfig,
} from '../../shared/configurable-tab-bar';

/* ─── Filter panel ─────────────────────────────────────── */

/**
 * Filters applied in the "search" tab mode — narrow the playlist list
 * down from the full user-owned set. Every field is optional and
 * treated as "no filter" when absent; the selector service combines
 * them with AND semantics.
 */
export interface TPlaylistFilters {
  /** Colour chips selected by the user. Empty = any colour. */
  colors: TPlaylistColor[];
  /** `[min, max]` inclusive on the summary's `trackCount`. */
  trackCountRange: [number, number] | null;
  /** `[min, max]` inclusive on `totalDurationSeconds`. */
  durationRange: [number, number] | null;
  /** Minimum mean rating (1–4) a playlist must exceed on each axis.
   *  Null = no floor for that axis. Playlists with `null` means are
   *  excluded by any non-null floor. */
  minMastery: number | null;
  minEnergy: number | null;
  minEffort: number | null;
  minQuality: number | null;
}

export const DEFAULT_PLAYLIST_FILTERS: TPlaylistFilters = {
  colors: [],
  trackCountRange: null,
  durationRange: null,
  minMastery: null,
  minEnergy: null,
  minEffort: null,
  minQuality: null,
};

/* ─── Tab config — discriminated by mode ──────────────── */

/** Search the full playlist list with a query string + filters. */
export interface TPlaylistSearchTabConfig {
  mode: 'search';
  searchQuery: string;
  filters: TPlaylistFilters;
}

/** Open a single playlist in detail view. */
export interface TPlaylistDetailTabConfig {
  mode: 'playlist';
  playlistId: TPlaylistId | null;
}

/** Compare 2–3 playlists side-by-side. */
export interface TPlaylistCompareTabConfig {
  mode: 'compare';
  playlistIds: TPlaylistId[];
}

/**
 * Discriminated union of every tab shape the playlists page can host.
 * The mode string narrows the other fields.
 */
export type TPlaylistTabConfig =
  | TPlaylistSearchTabConfig
  | TPlaylistDetailTabConfig
  | TPlaylistCompareTabConfig;

/** Default config for a newly opened tab — mirrors music-library's
 *  "start with an empty search" affordance. */
export function defaultPlaylistTabConfig(): TPlaylistTabConfig {
  return {
    mode: 'search',
    searchQuery: '',
    filters: { ...DEFAULT_PLAYLIST_FILTERS },
  };
}

export type PlaylistsTabItem = TabItem<TPlaylistTabConfig>;
export type PlaylistsSavedTabConfig = SavedTabConfig<TPlaylistTabConfig>;

/* ─── Frontend state shape ─────────────────────────────── */

/**
 * Full in-memory state for the playlists feature. Combines the
 * server-backed CRUD data (playlists + tracks) with the tab bar
 * state that is currently session-local (no backend endpoint yet).
 */
export interface PlaylistsState {
  playlists: TPlaylistSummaryViewModel[];
  tracks: TPlaylistTrackDomainModel[];
  selectedPlaylistId: string | null;
  tabs: PlaylistsTabItem[];
  activeTabId: string;
  activeConfigId: string | null;
  savedTabConfigs: PlaylistsSavedTabConfig[];
}
