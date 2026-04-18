import { computed, inject, Injectable } from '@angular/core';
import { PlaylistSelectorService } from './playlist-selector.service';
import { TrackSelectorService } from './track-selector.service';
import { MusicLibraryStateService } from '../../../../features/musicLibrary/services/music-library-state.service';
import { PlaylistsStateService } from '../playlists-state.service';
import type {
  PlaylistTrackView,
  PlaylistsTabItem,
  TPlaylistFilters,
  TPlaylistSummaryViewModel,
  TPlaylistTabConfig,
} from '../../playlist-types';

/**
 * Shallow fuzzy match used to filter the playlist list by its name and
 * description. Matches when every character of `query` appears in
 * `target` in order (case-insensitive).
 */
function fuzzyMatch(query: string, target: string): boolean {
  if (!target) return false;
  const q = query.toLowerCase();
  const t = target.toLowerCase();
  let qi = 0;
  for (let i = 0; i < t.length && qi < q.length; i++) {
    if (t[i] === q[qi]) qi++;
  }
  return qi === q.length;
}

/**
 * Apply the search-mode filter set to a single summary. Returns `true`
 * when the summary passes every active gate. Null / empty filter
 * fields are treated as "no constraint".
 */
function playlistMatchesFilters(
  summary: TPlaylistSummaryViewModel,
  filters: TPlaylistFilters,
): boolean {
  if (filters.colors.length > 0 && !filters.colors.includes(summary.color)) {
    return false;
  }

  if (filters.trackCountRange) {
    const [min, max] = filters.trackCountRange;
    if (summary.trackCount < min || summary.trackCount > max) return false;
  }

  if (filters.durationRange) {
    const [min, max] = filters.durationRange;
    if (
      summary.totalDurationSeconds < min ||
      summary.totalDurationSeconds > max
    )
      return false;
  }

  // Null means = no data — if the user asked for a floor on an axis
  // without data, exclude the playlist rather than silently include it.
  if (filters.minMastery !== null) {
    if (summary.meanMastery === null) return false;
    if (summary.meanMastery < filters.minMastery) return false;
  }
  if (filters.minEnergy !== null) {
    if (summary.meanEnergy === null) return false;
    if (summary.meanEnergy < filters.minEnergy) return false;
  }
  if (filters.minEffort !== null) {
    if (summary.meanEffort === null) return false;
    if (summary.meanEffort < filters.minEffort) return false;
  }
  if (filters.minQuality !== null) {
    if (summary.meanQuality === null) return false;
    if (summary.meanQuality < filters.minQuality) return false;
  }

  return true;
}

/**
 * Facade selector for the playlists feature.
 *
 * Fans out to the CRUD-focused selectors (`PlaylistSelectorService`,
 * `TrackSelectorService`) and adds the tab-aware projections the page
 * needs: active tab, filtered playlist list (in search mode), and the
 * resolved tracklist view-model for the currently opened playlist.
 */
@Injectable({ providedIn: 'root' })
export class PlaylistsSelectorService {
  private playlistSelector = inject(PlaylistSelectorService);
  private trackSelector = inject(TrackSelectorService);
  private musicLibrary = inject(MusicLibraryStateService);
  private state = inject(PlaylistsStateService);

  /* ─── Playlists + tracks (unchanged) ──────────────────── */

  playlists = this.playlistSelector.playlists;
  playlistsById = this.playlistSelector.playlistsById;
  selectedPlaylistId = this.playlistSelector.selectedPlaylistId;
  selectedPlaylist = this.playlistSelector.selectedPlaylist;

  tracks = this.trackSelector.tracks;
  tracksByPlaylistId = this.trackSelector.tracksByPlaylistId;

  /**
   * Track count per playlist. Uses the backend-authoritative value
   * from the summary, so the list stays accurate even before
   * `getPlaylistDetail` fires.
   */
  trackCount = computed(() => {
    const map = new Map<string, number>();
    for (const pl of this.playlists()) {
      map.set(pl.id, pl.trackCount);
    }
    return map;
  });

  totalPlaylists = computed(() => this.playlists().length);

  /* ─── Tab state projections ───────────────────────────── */

  readonly tabs = computed(() => this.state.playlists().tabs);
  readonly activeTabId = computed(() => this.state.playlists().activeTabId);
  readonly activeTab = computed((): PlaylistsTabItem | undefined => {
    const id = this.activeTabId();
    return this.tabs().find((t) => t.id === id);
  });
  readonly activeConfigId = computed(
    () => this.state.playlists().activeConfigId,
  );
  readonly savedTabConfigs = computed(
    () => this.state.playlists().savedTabConfigs,
  );

  /** Current tab's mode (search / playlist / compare). Useful when
   *  the template needs to switch on the mode without destructuring. */
  readonly activeMode = computed((): TPlaylistTabConfig['mode'] => {
    return this.activeTab()?.config.mode ?? 'search';
  });

  /* ─── Filtered results (search mode) ─────────────────── */

  /**
   * The list rendered in search mode — the user's playlists with the
   * current tab's query + filters applied. Returns every playlist
   * unfiltered when the active tab is not in search mode, which keeps
   * the side panel counts meaningful.
   */
  readonly filteredPlaylists = computed((): TPlaylistSummaryViewModel[] => {
    const tab = this.activeTab();
    const all = this.playlists();

    if (!tab || tab.config.mode !== 'search') return all;
    const { searchQuery, filters } = tab.config;

    let out = all.filter((pl) => playlistMatchesFilters(pl, filters));

    const query = searchQuery.trim();
    if (query) {
      out = out.filter(
        (pl) =>
          fuzzyMatch(query, pl.name) || fuzzyMatch(query, pl.description ?? ''),
      );
    }

    return out;
  });

  /* ─── Detail view ─────────────────────────────────────── */

  /**
   * Resolved view-model for the tracks of the currently selected
   * playlist (legacy v1 selection — the new "playlist" tab mode will
   * use the tab's `playlistId` directly in a later commit).
   */
  resolvedSelectedTracks = computed((): PlaylistTrackView[] => {
    const tracks = this.selectedPlaylistTracks();
    const entries = this.musicLibrary.library().entries;

    const refsById = new Map(entries.map((e) => [e.reference.id, e.reference]));
    const versionsById = new Map(
      entries.flatMap((e) => e.versions.map((v) => [v.id, v] as const)),
    );

    return tracks.map((t) => {
      const ref = refsById.get(t.referenceId);
      const version = versionsById.get(t.versionId);
      return {
        id: t.id,
        position: t.position,
        notes: t.notes,
        referenceId: t.referenceId,
        versionId: t.versionId,
        title: ref?.title ?? (t.referenceId as string),
        originalArtist: ref?.originalArtist ?? '—',
        versionLabel: version?.label ?? '',
      };
    });
  });

  private readonly selectedPlaylistTracks = computed(() => {
    const id = this.selectedPlaylistId();
    if (!id) return [];
    return this.tracksByPlaylistId().get(id) ?? [];
  });
}
