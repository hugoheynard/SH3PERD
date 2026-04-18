import { computed, inject, Injectable, signal } from '@angular/core';
import type { PlaylistsState, TPlaylistTabConfig } from '../playlist-types';
import { defaultPlaylistTabConfig } from '../playlist-types';
import { PlaylistsApiService } from './playlists-api.service';
import { ToastService } from '../../../shared/toast/toast.service';
import type {
  TabStateSignal,
  TabSystemState,
} from '../../../shared/configurable-tab-bar';

const DEFAULT_TAB_ID = 'playlists_default';

/**
 * In-memory store for the playlists feature.
 *
 * Owns three slices:
 * - `playlists` / `tracks` — server-backed CRUD state (loaded from
 *   `/playlists/me` + `/playlists/:id`).
 * - `selectedPlaylistId` — legacy selection used by the v1 sidebar UI.
 *   Kept in sync alongside the new tab model so older call-sites keep
 *   working until they migrate over.
 * - Tab state (`tabs` / `activeTabId` / `activeConfigId` /
 *   `savedTabConfigs`) — session-local workspace for the
 *   `ConfigurableTabBarComponent`. No backend persistence endpoint
 *   exists yet; tabs reset on reload. The `tabState` signal exposes
 *   the slice in the shape `TabMutationService<TPlaylistTabConfig>`
 *   expects.
 */
@Injectable({ providedIn: 'root' })
export class PlaylistsStateService {
  private readonly api = inject(PlaylistsApiService);
  private readonly toast = inject(ToastService);

  private state = signal<PlaylistsState>({
    playlists: [],
    tracks: [],
    selectedPlaylistId: null,
    tabs: [
      {
        id: DEFAULT_TAB_ID,
        title: 'All playlists',
        autoTitle: false,
        config: defaultPlaylistTabConfig(),
      },
    ],
    activeTabId: DEFAULT_TAB_ID,
    activeConfigId: null,
    savedTabConfigs: [],
  });

  private loaded = false;

  readonly playlists = computed(() => this.state());

  /**
   * Signal-like view over the tab-system slice. Extracted this way so
   * `PlaylistsTabMutationService` can inherit the generic
   * `TabMutationService<TPlaylistTabConfig>` without the base class
   * needing to know about the rest of the playlists state.
   */
  readonly tabState: TabStateSignal<TPlaylistTabConfig> = Object.assign(
    () => {
      const s = this.state();
      return {
        tabs: s.tabs,
        activeTabId: s.activeTabId,
        activeConfigId: s.activeConfigId,
        savedTabConfigs: s.savedTabConfigs,
      };
    },
    {
      update: (
        updater: (
          s: TabSystemState<TPlaylistTabConfig>,
        ) => TabSystemState<TPlaylistTabConfig>,
      ) => {
        this.state.update((s) => {
          const slice: TabSystemState<TPlaylistTabConfig> = {
            tabs: s.tabs,
            activeTabId: s.activeTabId,
            activeConfigId: s.activeConfigId,
            savedTabConfigs: s.savedTabConfigs,
          };
          return { ...s, ...updater(slice) };
        });
      },
    },
  );

  /** Fetch user's playlists from the backend. Idempotent — only fires once. */
  loadPlaylists(): void {
    if (this.loaded) return;
    this.loaded = true;

    this.api.getMyPlaylists().subscribe({
      next: (summaries) => {
        this.state.update((s) => ({
          ...s,
          playlists: summaries,
          selectedPlaylistId: s.selectedPlaylistId ?? summaries[0]?.id ?? null,
        }));
      },
      error: () => {
        this.toast.show('Failed to load playlists', 'error');
        this.loaded = false;
      },
    });
  }

  /** Force a reload on next loadPlaylists() call. */
  invalidate(): void {
    this.loaded = false;
  }

  updateState(updater: (state: PlaylistsState) => PlaylistsState): void {
    this.state.update(updater);
  }

  /**
   * No-op hook that matches the `onChanged` contract of
   * `TabMutationService`. Backend persistence for playlist tab configs
   * will be added in a follow-up PR; meanwhile tabs are session-only.
   */
  scheduleTabSave(): void {
    // Intentionally empty — no backend endpoint for playlist tab
    // configs yet. Mutations remain in-memory until the page reloads.
  }
}
