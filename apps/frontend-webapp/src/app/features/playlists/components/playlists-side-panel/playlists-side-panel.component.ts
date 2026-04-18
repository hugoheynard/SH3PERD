import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IconComponent } from '../../../../shared/icon/icon.component';
import { PlaylistsSelectorService } from '../../services/selector-layer/playlists-selector.service';
import { PlaylistsTabMutationService } from '../../services/mutations-layer/playlists-tab-mutation.service';
import {
  DEFAULT_PLAYLIST_FILTERS,
  PLAYLIST_COLORS,
  type PlaylistColor,
  type TPlaylistFilters,
} from '../../playlist-types';

/**
 * Filter side panel — only meaningful when the active tab is in
 * `search` mode. The panel binds straight to the active tab's
 * `filters` field via `PlaylistsTabMutationService.patchFilters` so
 * any mutation is reflected immediately in the search-mode selector.
 *
 * The panel never reads playlist data directly — it shows stats
 * projected by the parent page (e.g. total playlist count) and lets
 * the user narrow them with filters.
 */
@Component({
  selector: 'app-playlists-side-panel',
  standalone: true,
  imports: [FormsModule, IconComponent],
  templateUrl: './playlists-side-panel.component.html',
  styleUrl: './playlists-side-panel.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlaylistsSidePanelComponent {
  private selector = inject(PlaylistsSelectorService);
  private tabMutation = inject(PlaylistsTabMutationService);

  /** Stat — total number of playlists in the library. */
  readonly totalPlaylists = input.required<number>();

  /** Stat — number of playlists passing the current filters. */
  readonly filteredCount = input.required<number>();

  /** Master enum of colour choices for the chip row. */
  readonly allColors = PLAYLIST_COLORS;

  /** The 4 rating axes mapped to the filter keys. Rendering template
   *  iterates this once and reads/writes by key. */
  readonly ratingAxes = [
    { key: 'minMastery', label: 'Mastery' },
    { key: 'minEnergy', label: 'Energy' },
    { key: 'minEffort', label: 'Effort' },
    { key: 'minQuality', label: 'Quality' },
  ] as const;

  /** Active filters, pulled from the active search tab. Defaults to
   *  the empty preset when no search tab is active. */
  readonly filters = computed<TPlaylistFilters>(() => {
    const tab = this.selector.activeTab();
    if (!tab || tab.config.mode !== 'search') {
      return DEFAULT_PLAYLIST_FILTERS;
    }
    return tab.config.filters;
  });

  /** `true` when any axis differs from the default — drives the
   *  "Reset" button's visibility + the "Active" chip counter. */
  readonly hasActiveFilters = computed(() => {
    const f = this.filters();
    return (
      f.colors.length > 0 ||
      f.trackCountRange !== null ||
      f.durationRange !== null ||
      f.minMastery !== null ||
      f.minEnergy !== null ||
      f.minEffort !== null ||
      f.minQuality !== null
    );
  });

  /** Read the current min-tracks value, or the empty string when no
   *  floor is set (input binding prefers '' over 0 for a clean UX). */
  readonly minTracks = computed(
    () => this.filters().trackCountRange?.[0]?.toString() ?? '',
  );

  /** Minimum duration rendered in minutes (converted from seconds). */
  readonly minDurationMinutes = computed(() => {
    const range = this.filters().durationRange;
    if (!range) return '';
    return Math.round(range[0] / 60).toString();
  });

  /* ── Color chips ─────────────────────────────── */

  isColorActive(color: PlaylistColor): boolean {
    return this.filters().colors.includes(color);
  }

  toggleColor(color: PlaylistColor): void {
    const current = this.filters().colors;
    const next = current.includes(color)
      ? current.filter((c) => c !== color)
      : [...current, color];
    this.patch({ colors: next });
  }

  /* ── Track count min ─────────────────────────── */

  onMinTracksChange(raw: string): void {
    const n = raw === '' ? null : Number.parseInt(raw, 10);
    if (n === null || Number.isNaN(n) || n <= 0) {
      this.patch({ trackCountRange: null });
      return;
    }
    this.patch({ trackCountRange: [n, Number.MAX_SAFE_INTEGER] });
  }

  /* ── Duration min (minutes → seconds) ────────── */

  onMinDurationChange(raw: string): void {
    const n = raw === '' ? null : Number.parseInt(raw, 10);
    if (n === null || Number.isNaN(n) || n <= 0) {
      this.patch({ durationRange: null });
      return;
    }
    this.patch({ durationRange: [n * 60, Number.MAX_SAFE_INTEGER] });
  }

  /* ── Rating minima ───────────────────────────── */

  getMinRating(key: (typeof this.ratingAxes)[number]['key']): number {
    return this.filters()[key] ?? 0;
  }

  setMinRating(
    key: (typeof this.ratingAxes)[number]['key'],
    value: number,
  ): void {
    const next = value <= 0 ? null : Math.min(4, Math.max(1, value));
    this.patch({ [key]: next } as Partial<TPlaylistFilters>);
  }

  /* ── Reset ──────────────────────────────────── */

  reset(): void {
    const tab = this.selector.activeTab();
    if (!tab || tab.config.mode !== 'search') return;
    this.tabMutation.resetFilters(tab.id);
  }

  /* ── Internal dispatcher ─────────────────────── */

  private patch(patch: Partial<TPlaylistFilters>): void {
    const tab = this.selector.activeTab();
    if (!tab || tab.config.mode !== 'search') return;
    this.tabMutation.patchFilters(tab.id, patch);
  }
}
