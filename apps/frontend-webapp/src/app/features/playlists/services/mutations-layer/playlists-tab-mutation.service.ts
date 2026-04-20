import { inject, Injectable } from '@angular/core';
import { TabMutationService } from '../../../../shared/configurable-tab-bar';
import { PlaylistsStateService } from '../playlists-state.service';
import {
  defaultPlaylistTabConfig,
  DEFAULT_PLAYLIST_FILTERS,
  type TPlaylistTabConfig,
  type TPlaylistFilters,
} from '../../playlist-types';
import type { TPlaylistId } from '@sh3pherd/shared-types';

/**
 * Playlist-specific tab mutation service. Inherits all generic tab
 * CRUD + saved-config behaviour from `TabMutationService` and adds
 * mutations scoped to the three tab modes (search / playlist /
 * compare).
 *
 * Quota gating is intentionally absent for now — the playlist quota
 * keys (`playlist_count`, `playlist_search_tab`) aren't wired into
 * `PLAN_QUOTAS` yet, so nothing to gate on. When they land, override
 * `addDefaultTab` / `saveTabConfig` / `moveTabToConfig` the same way
 * `MusicTabMutationService` does.
 */
@Injectable({ providedIn: 'root' })
export class PlaylistsTabMutationService extends TabMutationService<TPlaylistTabConfig> {
  constructor() {
    const state = inject(PlaylistsStateService);
    super(state.tabState, defaultPlaylistTabConfig, () =>
      state.scheduleTabSave(),
    );
  }

  /* ── Search-mode mutations ────────────────────── */

  /** Update the free-text search query on a search-mode tab. No-op on
   *  other modes — mode switch goes through `switchMode()`. */
  setSearchQuery(tabId: string, query: string): void {
    this.patchTabConfig(tabId, (c) =>
      c.mode === 'search' ? { ...c, searchQuery: query } : c,
    );
  }

  /** Replace the filter object on a search-mode tab with a fresh one. */
  setFilters(tabId: string, filters: TPlaylistFilters): void {
    this.patchTabConfig(tabId, (c) =>
      c.mode === 'search' ? { ...c, filters } : c,
    );
  }

  /** Partial update of the filters on a search-mode tab — merges
   *  `patch` into the current filters object. */
  patchFilters(tabId: string, patch: Partial<TPlaylistFilters>): void {
    this.patchTabConfig(tabId, (c) =>
      c.mode === 'search' ? { ...c, filters: { ...c.filters, ...patch } } : c,
    );
  }

  /** Reset filters to the default (all null / empty). */
  resetFilters(tabId: string): void {
    this.patchTabConfig(tabId, (c) =>
      c.mode === 'search'
        ? { ...c, filters: { ...DEFAULT_PLAYLIST_FILTERS } }
        : c,
    );
  }

  /* ── Mode switching ───────────────────────────── */

  /**
   * Switch the active tab to "playlist" mode, viewing a single
   * playlist. Used when the user clicks a card in the list view.
   */
  openPlaylistTab(tabId: string, playlistId: TPlaylistId): void {
    this.patchTabConfig(
      tabId,
      (): TPlaylistTabConfig => ({
        mode: 'playlist',
        playlistId,
      }),
    );
  }

  /**
   * Switch the active tab to "compare" mode with the given playlists.
   * Caller is responsible for enforcing the 2-3 count.
   */
  openCompareTab(tabId: string, playlistIds: TPlaylistId[]): void {
    this.patchTabConfig(
      tabId,
      (): TPlaylistTabConfig => ({
        mode: 'compare',
        playlistIds,
      }),
    );
  }

  /** Flip the active tab back to the search-mode default. */
  openSearchTab(tabId: string): void {
    this.patchTabConfig(tabId, () => defaultPlaylistTabConfig());
  }

  /* ── Compare-mode mutations ───────────────────── */

  /** Add a playlist to a compare-mode tab (no-op if already present
   *  or if the tab is not in compare mode). */
  addToCompare(tabId: string, playlistId: TPlaylistId): void {
    this.patchTabConfig(tabId, (c) => {
      if (c.mode !== 'compare') return c;
      if (c.playlistIds.includes(playlistId)) return c;
      return { ...c, playlistIds: [...c.playlistIds, playlistId] };
    });
  }

  /** Remove a playlist from a compare-mode tab. */
  removeFromCompare(tabId: string, playlistId: TPlaylistId): void {
    this.patchTabConfig(tabId, (c) => {
      if (c.mode !== 'compare') return c;
      return {
        ...c,
        playlistIds: c.playlistIds.filter((id) => id !== playlistId),
      };
    });
  }
}
