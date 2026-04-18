import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
  type OnInit,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PlaylistsStateService } from '../services/playlists-state.service';
import { PlaylistsSelectorService } from '../services/selector-layer/playlists-selector.service';
import { PlaylistMutationService } from '../services/mutations-layer/playlist-mutation.service';
import { PlaylistsTabMutationService } from '../services/mutations-layer/playlists-tab-mutation.service';
import {
  ConfigurableTabBarComponent,
  provideTabHandlers,
} from '../../../shared/configurable-tab-bar';
import { IconComponent } from '../../../shared/icon/icon.component';
import { ButtonComponent } from '../../../shared/button/button.component';
import { PLAYLIST_COLORS } from '../playlist-types';
import type { PlaylistColor } from '../playlist-types';
import { PlaylistCardComponent } from '../components/playlist-card/playlist-card.component';
import { PlaylistsSidePanelComponent } from '../components/playlists-side-panel/playlists-side-panel.component';
import { PlaylistDetailComponent } from '../components/playlist-detail/playlist-detail.component';
import { PlaylistCompareComponent } from '../components/playlist-compare/playlist-compare.component';
import type { TPlaylistId } from '@sh3pherd/shared-types';

/**
 * Playlists page — mirrors the music-library layout:
 *
 * ```
 * ┌───────────────┬──────────────────────────────────┐
 * │ side panel    │ tab bar + [trailing search]      │
 * │ (filters,     ├──────────────────────────────────┤
 * │  stats)       │ toolbar (results count, add btn) │
 * │               ├──────────────────────────────────┤
 * │               │ content area — switches on the   │
 * │               │ active tab mode (search / play-  │
 * │               │ list / compare)                  │
 * └───────────────┴──────────────────────────────────┘
 * ```
 *
 * The `search` mode renders a grid of playlist cards. Clicking a card
 * switches the active tab into `playlist` mode (detail view).
 * Selecting 2-3 playlists and pressing "Compare" switches to
 * `compare` mode. All three sub-views are tied to the same tab item
 * so each mode shift is a one-step `mutation.patchTabConfig` away.
 */
@Component({
  selector: 'app-playlists-page',
  standalone: true,
  imports: [
    FormsModule,
    ConfigurableTabBarComponent,
    IconComponent,
    ButtonComponent,
    PlaylistCardComponent,
    PlaylistsSidePanelComponent,
    PlaylistDetailComponent,
    PlaylistCompareComponent,
  ],
  templateUrl: './playlists-page.component.html',
  styleUrl: './playlists-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [provideTabHandlers(PlaylistsTabMutationService)],
})
export class PlaylistsPageComponent implements OnInit {
  private stateService = inject(PlaylistsStateService);
  public selector = inject(PlaylistsSelectorService);
  private playlistMutation = inject(PlaylistMutationService);
  private tabMutation = inject(PlaylistsTabMutationService);

  readonly colors = PLAYLIST_COLORS;

  /** Mobile side panel toggle. */
  readonly mobilePanelOpen = signal(false);

  /** Quota locks — not wired yet, playlist quota keys aren't in PLAN_QUOTAS.
   *  Kept as signals so the tab-bar template binding doesn't change when
   *  the real checker lands. */
  readonly tabLocked = computed(() => false);
  readonly configLocked = computed(() => false);

  /** Current search query for the active tab, or '' when the tab is
   *  not in search mode. */
  readonly activeSearchQuery = computed(() => {
    const tab = this.selector.activeTab();
    return tab?.config.mode === 'search' ? tab.config.searchQuery : '';
  });

  /** Tracks whether the search-mode controls should be visible. */
  readonly isSearchMode = computed(
    () => this.selector.activeMode() === 'search',
  );

  /** `playlistId` of the active tab when in `playlist` mode, else null.
   *  Passed straight to <app-playlist-detail>. */
  readonly activePlaylistId = computed<TPlaylistId | null>(() => {
    const tab = this.selector.activeTab();
    if (!tab || tab.config.mode !== 'playlist') return null;
    return tab.config.playlistId;
  });

  /** IDs being compared when the active tab is in `compare` mode. */
  readonly compareIds = computed<TPlaylistId[]>(() => {
    const tab = this.selector.activeTab();
    if (!tab || tab.config.mode !== 'compare') return [];
    return tab.config.playlistIds;
  });

  /** Enable the toolbar "Compare" button once at least two playlists
   *  match the active search. Compare mode needs ≥ 2 columns to be
   *  meaningful, so anything less renders the button as a no-op. */
  readonly canStartQuickCompare = computed(
    () => this.selector.filteredPlaylists().length >= 2,
  );

  /** Entry point from the toolbar. Picks up to the first 3 filtered
   *  playlists and switches the active tab into compare mode. A finer
   *  multi-select UX (checkboxes on cards) is tracked for a later
   *  iteration; this default keeps the mode reachable without extra
   *  moving parts. */
  startQuickCompare(): void {
    const ids = this.selector
      .filteredPlaylists()
      .slice(0, 3)
      .map((p) => p.id) as TPlaylistId[];
    if (ids.length < 2) return;
    this.tabMutation.openCompareTab(this.selector.activeTabId(), ids);
  }

  onCompareRemove(id: TPlaylistId): void {
    this.tabMutation.removeFromCompare(this.selector.activeTabId(), id);
  }

  ngOnInit(): void {
    this.stateService.loadPlaylists();
  }

  /* ── Search controls ─────────────────────────── */

  onSearchQueryChange(query: string): void {
    this.tabMutation.setSearchQuery(this.selector.activeTabId(), query);
  }

  toggleMobilePanel(): void {
    this.mobilePanelOpen.update((v) => !v);
  }

  /* ── Tab lock stubs (no-op until quotas land) ── */

  openTabQuotaPopover(): void {
    // Intentionally empty: playlist quotas aren't enforced yet.
  }

  openConfigQuotaPopover(): void {
    // Intentionally empty: config quotas aren't enforced yet.
  }

  openConfigFullPopover(_event: { targetConfigId: string }): void {
    // Intentionally empty.
  }

  /* ── Playlist create stub (full popover comes in a later commit) ── */

  addPlaylist(): void {
    const n = this.selector.totalPlaylists() + 1;
    this.playlistMutation.addPlaylist(`Playlist ${n}`, 'indigo');
  }

  /* ── Placeholder mode-switch helpers (real call-sites wire in next commits) ── */

  openPlaylistInTab(playlistId: string): void {
    this.tabMutation.openPlaylistTab(
      this.selector.activeTabId(),
      playlistId as never,
    );
  }

  openCompareInTab(playlistIds: string[]): void {
    this.tabMutation.openCompareTab(
      this.selector.activeTabId(),
      playlistIds as never,
    );
  }

  returnToSearch(): void {
    this.tabMutation.openSearchTab(this.selector.activeTabId());
  }

  /** Used by placeholder cards in the content area until the dedicated
   *  card component lands in the next commit. */
  setPlaylistColor(id: string, color: PlaylistColor): void {
    this.playlistMutation.updatePlaylist(id, { color });
  }
}
