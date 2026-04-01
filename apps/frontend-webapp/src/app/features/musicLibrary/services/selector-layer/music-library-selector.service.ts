import { computed, inject, Injectable } from '@angular/core';
import { MusicLibraryStateService } from '../music-library-state.service';
import type {
  LibraryEntry,
  MusicDataFilter,
  MusicVersion,
  Rating,
  VersionTrack,
} from '../../music-library-types';

function fuzzyMatch(query: string, target: string): boolean {
  const q = query.toLowerCase();
  const t = target.toLowerCase();
  let qi = 0;
  for (let i = 0; i < t.length && qi < q.length; i++) {
    if (t[i] === q[qi]) qi++;
  }
  return qi === q.length;
}

/**
 * Unified selector service for the Music Library feature.
 * Works with the entry-centric state shape (LibraryEntry[]).
 */
@Injectable({ providedIn: 'root' })
export class MusicLibrarySelectorService {

  private state = inject(MusicLibraryStateService);

  /* ─── Raw state ─────────────────────────────────────── */

  readonly entries = computed(() => this.state.library().entries);

  /* ─── Tabs ──────────────────────────────────────────── */

  readonly tabs = computed(() => this.state.library().tabs);
  readonly activeTabId = computed(() => this.state.library().activeTabId);
  readonly activeTab = computed(() => {
    const id = this.activeTabId();
    return this.tabs().find(t => t.id === id);
  });
  readonly activeConfigId = computed(() => this.state.library().activeConfigId);
  readonly savedTabConfigs = computed(() => this.state.library().savedTabConfigs ?? []);

  /* ─── Filtered results (entry-centric) ─────────────── */

  /**
   * Returns the filtered list of library entries based on the active tab's config.
   * Each entry contains reference + versions — no re-joining needed.
   */
  readonly activeEntries = computed((): LibraryEntry[] => {
    const tab = this.activeTab();
    let results = this.entries();

    if (!tab) return results;

    const { dataFilterActive, dataFilter } = tab.config.searchConfig;

    // Apply data filters on versions within each entry
    if (dataFilterActive && dataFilter) {
      results = results.filter(entry =>
        entry.versions.some(v => this.versionMatchesFilter(v, dataFilter)),
      );
    }

    // Apply text search on reference title/artist
    const query = (tab.config.searchQuery ?? '').trim();
    if (query) {
      results = results.filter(entry =>
        fuzzyMatch(query, entry.reference.title) ||
        fuzzyMatch(query, entry.reference.originalArtist),
      );
    }

    return results;
  });

  /* ─── Lookup helpers ────────────────────────────────── */

  /** Find a specific entry by its id. */
  findEntry(entryId: string): LibraryEntry | undefined {
    return this.entries().find(e => e.id === entryId);
  }

  /** Find entry by reference id. */
  findEntryByRefId(refId: string): LibraryEntry | undefined {
    return this.entries().find(e => e.reference.id === refId);
  }

  /* ─── Stats ─────────────────────────────────────────── */

  readonly totalEntries = computed(() => this.entries().length);

  readonly totalVersions = computed(() =>
    this.entries().reduce((sum, e) => sum + e.versions.length, 0),
  );

  readonly averageMastery = computed(() => {
    const all = this.entries().flatMap(e => e.versions);
    if (all.length === 0) return 0;
    const sum = all.reduce((acc, v) => acc + v.mastery, 0);
    return Math.round((sum / all.length) * 10) / 10;
  });

  readonly averageQuality = computed(() => {
    const qualities = this.entries()
      .flatMap(e => e.versions)
      .map(v => MusicLibrarySelectorService.favoriteQuality(v))
      .filter((q): q is number => q !== undefined);
    if (qualities.length === 0) return 0;
    const sum = qualities.reduce((acc, q) => acc + q, 0);
    return Math.round((sum / qualities.length) * 10) / 10;
  });

  /* ─── Cross context ─────────────────────────────────── */

  readonly crossContext = computed(() => this.state.library().crossContext ?? null);

  /* ─── Track helpers (static, usable in templates) ──── */

  static favoriteTrack(version: MusicVersion): VersionTrack | undefined {
    return version.tracks.find(t => t.favorite);
  }

  static favoriteQuality(version: MusicVersion): number | undefined {
    return MusicLibrarySelectorService.favoriteTrack(version)?.analysisResult?.quality;
  }

  static favoriteDuration(version: MusicVersion): number | undefined {
    const track = MusicLibrarySelectorService.favoriteTrack(version);
    return track?.analysisResult?.durationSeconds ?? track?.durationSeconds ?? undefined;
  }

  static favoriteBpm(version: MusicVersion): number | undefined {
    const bpm = MusicLibrarySelectorService.favoriteTrack(version)?.analysisResult?.bpm;
    return bpm != null ? Math.round(bpm) : undefined;
  }

  static favoriteKey(version: MusicVersion): string | undefined {
    const a = MusicLibrarySelectorService.favoriteTrack(version)?.analysisResult;
    if (!a?.key) return undefined;
    return `${a.key}${a.keyScale === 'minor' ? 'm' : ''}`;
  }

  static hasTrack(version: MusicVersion): boolean {
    return version.tracks.length > 0;
  }

  /* ─── Private ───────────────────────────────────────── */

  private versionMatchesFilter(v: MusicVersion, f: MusicDataFilter): boolean {
    if (f.genres?.length  && !f.genres.includes(v.genre))              return false;
    if (f.mastery?.length && !f.mastery.includes(v.mastery as Rating)) return false;
    if (f.energy?.length  && !f.energy.includes(v.energy as Rating))   return false;
    if (f.effort?.length  && !f.effort.includes(v.effort as Rating))   return false;
    if (f.quality?.length) {
      const q = MusicLibrarySelectorService.favoriteQuality(v);
      if (!q || !f.quality.includes(q as Rating)) return false;
    }
    if (f.bpm) {
      const bpm = MusicLibrarySelectorService.favoriteBpm(v) ?? v.bpm;
      if (bpm != null && (bpm < f.bpm.min || bpm > f.bpm.max)) return false;
    }
    if (f.duration) {
      const dur = MusicLibrarySelectorService.favoriteDuration(v);
      if (dur != null && (dur < f.duration.min || dur > f.duration.max)) return false;
    }
    return true;
  }
}
