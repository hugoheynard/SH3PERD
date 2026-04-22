import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
  type OnInit,
} from '@angular/core';
import { Router } from '@angular/router';
import type {
  TPlaylistSummaryViewModel,
  TShowSummaryViewModel,
  TUserMusicLibraryViewModel,
} from '@sh3pherd/shared-types';
import { MusicLibraryApiService } from '../../musicLibrary/services/music-library-api.service';
import { PlaylistsApiService } from '../../playlists/services/playlists-api.service';
import { ShowsApiService } from '../../shows/services/shows-api.service';
import { UserContextService } from '../../../core/services/user-context.service';
import { ButtonComponent } from '../../../shared/button/button.component';
import { EmptyStateComponent } from '../../../shared/empty-state/empty-state.component';
import { IconComponent } from '../../../shared/icon/icon.component';
import { LoadingStateComponent } from '../../../shared/loading-state/loading-state.component';
import {
  TabNavComponent,
  type TabNavItem,
} from '../../../shared/tab-nav/tab-nav.component';

type StatsTabKey = 'music' | 'playlists' | 'shows';

type StatsSummary = {
  primary: number;
  secondary: number;
  tertiary: number;
  quaternary: string;
};

const ICON_MUSIC = 'M12 3v10.55A4 4 0 1 0 14 17V7h4V3h-6z';
const ICON_PLAYLIST =
  'M3 10h12v2H3v-2zm0-4h18v2H3V6zm0 8h8v2H3v-2zm14 0v-3.55A4 4 0 1 0 19 14V4h-2v10z';
const ICON_SHOWS =
  'M12 2a3 3 0 0 0-3 3v6a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3zm5.3 9a5.3 5.3 0 0 1-4.3 5.2V20h3v2H8v-2h3v-3.8A5.3 5.3 0 0 1 6.7 11H9a3 3 0 0 0 6 0h2.3z';

@Component({
  selector: 'app-stats-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ButtonComponent,
    EmptyStateComponent,
    IconComponent,
    LoadingStateComponent,
    TabNavComponent,
  ],
  templateUrl: './stats-page.component.html',
  styleUrl: './stats-page.component.scss',
})
export class StatsPageComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly userCtx = inject(UserContextService);
  private readonly musicApi = inject(MusicLibraryApiService);
  private readonly playlistsApi = inject(PlaylistsApiService);
  private readonly showsApi = inject(ShowsApiService);

  readonly activeTab = signal<StatsTabKey>('music');

  readonly musicLoading = signal(false);
  readonly playlistsLoading = signal(false);
  readonly showsLoading = signal(false);

  readonly music = signal<TUserMusicLibraryViewModel | null>(null);
  readonly playlists = signal<TPlaylistSummaryViewModel[]>([]);
  readonly shows = signal<TShowSummaryViewModel[]>([]);

  readonly canUseShows = this.userCtx.canUseShows;

  readonly tabs = computed<TabNavItem[]>(() => {
    const tabs: TabNavItem[] = [
      { key: 'music', label: 'Music Library', icon: ICON_MUSIC },
      { key: 'playlists', label: 'Playlists', icon: ICON_PLAYLIST },
    ];

    if (this.canUseShows()) {
      tabs.push({ key: 'shows', label: 'Shows', icon: ICON_SHOWS });
    }

    return tabs;
  });

  readonly musicSummary = computed<StatsSummary>(() => {
    const library = this.music();
    if (!library) {
      return {
        primary: 0,
        secondary: 0,
        tertiary: 0,
        quaternary: '0 avg versions / ref',
      };
    }

    const totalTracks = library.entries.reduce(
      (sum, entry) =>
        sum +
        entry.versions.reduce(
          (inner, version) => inner + version.tracks.length,
          0,
        ),
      0,
    );

    const avgVersionsPerRef =
      library.totalEntries > 0
        ? library.totalVersions / library.totalEntries
        : 0;

    return {
      primary: library.totalEntries,
      secondary: library.totalVersions,
      tertiary: totalTracks,
      quaternary: `${avgVersionsPerRef.toFixed(1)} avg versions / ref`,
    };
  });

  readonly playlistsSummary = computed<StatsSummary>(() => {
    const playlists = this.playlists();
    const totalTracks = playlists.reduce(
      (sum, playlist) => sum + playlist.trackCount,
      0,
    );
    const totalDuration = playlists.reduce(
      (sum, playlist) => sum + playlist.totalDurationSeconds,
      0,
    );
    const avgTracks = playlists.length > 0 ? totalTracks / playlists.length : 0;

    return {
      primary: playlists.length,
      secondary: totalTracks,
      tertiary: totalDuration,
      quaternary: `${avgTracks.toFixed(1)} avg tracks / playlist`,
    };
  });

  readonly showsSummary = computed<StatsSummary>(() => {
    const shows = this.shows();
    const totalSections = shows.reduce(
      (sum, show) => sum + show.sectionCount,
      0,
    );
    const totalTracks = shows.reduce((sum, show) => sum + show.trackCount, 0);
    const totalDuration = shows.reduce(
      (sum, show) => sum + show.totalDurationSeconds,
      0,
    );

    return {
      primary: shows.length,
      secondary: totalSections,
      tertiary: totalTracks,
      quaternary: this.formatDuration(totalDuration),
    };
  });

  readonly largestPlaylist = computed<TPlaylistSummaryViewModel | null>(() => {
    return this.playlists().reduce<TPlaylistSummaryViewModel | null>(
      (largest, playlist) =>
        !largest || playlist.trackCount > largest.trackCount
          ? playlist
          : largest,
      null,
    );
  });

  readonly largestShow = computed<TShowSummaryViewModel | null>(() => {
    return this.shows().reduce<TShowSummaryViewModel | null>(
      (largest, show) =>
        !largest || show.trackCount > largest.trackCount ? show : largest,
      null,
    );
  });

  ngOnInit(): void {
    this.loadMusicStats();
    this.loadPlaylistStats();
    if (this.canUseShows()) {
      this.loadShowsStats();
    }
  }

  onTabChange(tab: string): void {
    this.activeTab.set(tab as StatsTabKey);
  }

  openMusicLibrary(): void {
    this.router.navigate(['/app/musicLibrary']);
  }

  openPlaylists(): void {
    this.router.navigate(['/app/playlistManager']);
  }

  openShows(): void {
    this.router.navigate(['/app/shows']);
  }

  formatDuration(totalSeconds: number): string {
    const minutes = Math.round(totalSeconds / 60);
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes === 0
      ? `${hours}h`
      : `${hours}h ${remainingMinutes}m`;
  }

  private loadMusicStats(): void {
    this.musicLoading.set(true);
    this.musicApi.getMyLibrary().subscribe({
      next: (library) => {
        this.music.set(library);
        this.musicLoading.set(false);
      },
      error: () => this.musicLoading.set(false),
    });
  }

  private loadPlaylistStats(): void {
    this.playlistsLoading.set(true);
    this.playlistsApi.getMyPlaylists().subscribe({
      next: (playlists) => {
        this.playlists.set(playlists);
        this.playlistsLoading.set(false);
      },
      error: () => this.playlistsLoading.set(false),
    });
  }

  private loadShowsStats(): void {
    this.showsLoading.set(true);
    this.showsApi.getMyShows().subscribe({
      next: (shows) => {
        this.shows.set(shows);
        this.showsLoading.set(false);
      },
      error: () => this.showsLoading.set(false),
    });
  }
}
