import { computed, inject, Injectable } from '@angular/core';
import { MusicLibraryStateService } from '../music-library-state.service';
import type {
  LibraryEntry,
  MusicDataFilter,
  MusicVersion,
  Rating,
  VersionTrack,
} from '../../music-library-types';

/**
 * Normalise a string for user-facing search: strip accents, zero-width glyphs
 * and collapse whitespace. "Bohémian  Rhapsody\u200B" → "bohemian rhapsody".
 */
function normalize(s: string): string {
  return s
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[\u200B-\u200D\uFEFF]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}

/** Minimal Levenshtein — bounded on either side by the shorter string length. */
function levenshtein(a: string, b: string): number {
  if (a === b) return 0;
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;

  let prev = new Array(b.length + 1);
  let curr = new Array(b.length + 1);
  for (let j = 0; j <= b.length; j++) prev[j] = j;

  for (let i = 1; i <= a.length; i++) {
    curr[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      curr[j] = Math.min(curr[j - 1] + 1, prev[j] + 1, prev[j - 1] + cost);
    }
    [prev, curr] = [curr, prev];
  }
  return prev[b.length];
}

function subsequence(q: string, t: string): boolean {
  let qi = 0;
  for (let i = 0; i < t.length && qi < q.length; i++) {
    if (t[i] === q[qi]) qi++;
  }
  return qi === q.length;
}

/**
 * User-facing fuzzy match with three progressively laxer strategies. Both
 * strings are Unicode-normalised first so "eltn" matches "Élton Jòhn".
 *
 * 1. Normalised substring — fastest, exact.
 * 2. Per-token Levenshtein with a length-scaled threshold — tolerates typos
 *    on a single word ("eltn" ≈ "elton", "jon" ≈ "john").
 * 3. Subsequence match on the full string — abbreviation style ("bhrp" hits
 *    "bohemian rhapsody"). Kept as a last resort because it over-matches
 *    short queries; the Levenshtein fast-path runs first.
 */
function fuzzyMatch(query: string, target: string): boolean {
  const q = normalize(query);
  const t = normalize(target);
  if (!q) return true;

  if (t.includes(q)) return true;

  if (q.length >= 3) {
    const threshold = Math.max(1, Math.floor(q.length / 4));
    for (const tok of t.split(' ')) {
      if (tok.includes(q)) return true;
      if (
        Math.abs(tok.length - q.length) <= threshold &&
        levenshtein(tok, q) <= threshold
      ) {
        return true;
      }
    }
  }

  return subsequence(q, t);
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
    return this.tabs().find((t) => t.id === id);
  });
  readonly activeConfigId = computed(() => this.state.library().activeConfigId);
  readonly savedTabConfigs = computed(
    () => this.state.library().savedTabConfigs ?? [],
  );

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
      results = results.filter((entry) =>
        entry.versions.some((v) => this.versionMatchesFilter(v, dataFilter)),
      );
    }

    // Apply text search on reference title/artist
    const query = (tab.config.searchQuery ?? '').trim();
    if (query) {
      results = results.filter(
        (entry) =>
          fuzzyMatch(query, entry.reference.title) ||
          fuzzyMatch(query, entry.reference.originalArtist),
      );
    }

    return results;
  });

  /* ─── Lookup helpers ────────────────────────────────── */

  /** Find a specific entry by its id. */
  findEntry(entryId: string): LibraryEntry | undefined {
    return this.entries().find((e) => e.id === entryId);
  }

  /** Find entry by reference id. */
  findEntryByRefId(refId: string): LibraryEntry | undefined {
    return this.entries().find((e) => e.reference.id === refId);
  }

  /* ─── Stats ─────────────────────────────────────────── */

  readonly totalEntries = computed(() => this.entries().length);

  readonly totalVersions = computed(() =>
    this.entries().reduce((sum, e) => sum + e.versions.length, 0),
  );

  readonly averageMastery = computed(() => {
    const all = this.entries().flatMap((e) => e.versions);
    if (all.length === 0) return 0;
    const sum = all.reduce((acc, v) => acc + v.mastery, 0);
    return Math.round((sum / all.length) * 10) / 10;
  });

  readonly averageQuality = computed(() => {
    const qualities = this.entries()
      .flatMap((e) => e.versions)
      .map((v) => MusicLibrarySelectorService.favoriteQuality(v))
      .filter((q): q is number => q !== undefined);
    if (qualities.length === 0) return 0;
    const sum = qualities.reduce((acc, q) => acc + q, 0);
    return Math.round((sum / qualities.length) * 10) / 10;
  });

  /* ─── Cross context ─────────────────────────────────── */

  readonly crossContext = computed(
    () => this.state.library().crossContext ?? null,
  );

  /* ─── Track helpers (static, usable in templates) ──── */

  static favoriteTrack(version: MusicVersion): VersionTrack | undefined {
    return version.tracks.find((t) => t.favorite);
  }

  static favoriteQuality(version: MusicVersion): number | undefined {
    return MusicLibrarySelectorService.favoriteTrack(version)?.analysisResult
      ?.quality;
  }

  static favoriteDuration(version: MusicVersion): number | undefined {
    const track = MusicLibrarySelectorService.favoriteTrack(version);
    return (
      track?.analysisResult?.durationSeconds ??
      track?.durationSeconds ??
      undefined
    );
  }

  static favoriteBpm(version: MusicVersion): number | undefined {
    const bpm =
      MusicLibrarySelectorService.favoriteTrack(version)?.analysisResult?.bpm;
    return bpm != null ? Math.round(bpm) : undefined;
  }

  static favoriteKey(version: MusicVersion): string | undefined {
    const a =
      MusicLibrarySelectorService.favoriteTrack(version)?.analysisResult;
    if (!a?.key) return undefined;
    return `${a.key}${a.keyScale === 'minor' ? 'm' : ''}`;
  }

  static hasTrack(version: MusicVersion): boolean {
    return version.tracks.length > 0;
  }

  /* ─── Private ───────────────────────────────────────── */

  private versionMatchesFilter(v: MusicVersion, f: MusicDataFilter): boolean {
    if (f.genres?.length && !f.genres.includes(v.genre)) return false;
    if (f.mastery?.length && !f.mastery.includes(v.mastery as Rating))
      return false;
    if (f.energy?.length && !f.energy.includes(v.energy as Rating))
      return false;
    if (f.effort?.length && !f.effort.includes(v.effort as Rating))
      return false;
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
      if (dur != null && (dur < f.duration.min || dur > f.duration.max))
        return false;
    }
    return true;
  }
}
