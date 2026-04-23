import { TestBed } from '@angular/core/testing';
import { signal, type Signal } from '@angular/core';
import { MusicLibrarySelectorService } from './music-library-selector.service';
import { MusicLibraryStateService } from '../music-library-state.service';
import { Genre } from '../../music-library-types';
import type {
  LibraryEntry,
  MusicLibraryState,
  MusicTab,
  MusicVersion,
  Rating,
  VersionTrack,
} from '../../music-library-types';

function track(overrides: Partial<VersionTrack> = {}): VersionTrack {
  return {
    id: overrides.id ?? 'track_1',
    fileName: 'a.mp3',
    uploadedAt: 0,
    favorite: true,
    ...overrides,
  } as VersionTrack;
}

function analysedTrack(
  overrides: Partial<VersionTrack['analysisResult']> = {},
): VersionTrack {
  return track({
    favorite: true,
    analysisResult: {
      integratedLUFS: -14,
      loudnessRange: 7,
      truePeakdBTP: -1,
      SNRdB: 40,
      clippingRatio: 0,
      bpm: 120,
      key: 'C',
      keyScale: 'major',
      keyStrength: 0.9,
      durationSeconds: 180,
      sampleRate: 44100,
      quality: 4 as Rating,
      ...overrides,
    } as VersionTrack['analysisResult'],
  });
}

function version(overrides: Partial<MusicVersion> = {}): MusicVersion {
  return {
    id: 'musicVer_1',
    owner_id: 'user_1',
    musicReference_id: 'musicRef_1',
    label: 'Original',
    genre: Genre.Pop,
    type: 'Original',
    bpm: 120,
    pitch: null,
    mastery: 3,
    energy: 3,
    effort: 2,
    tracks: [],
    ...overrides,
  } as MusicVersion;
}

function entry(overrides: Partial<LibraryEntry> = {}): LibraryEntry {
  return {
    id: 'repEntry_1',
    owner_id: 'user_1',
    reference: {
      id: 'musicRef_1',
      title: 'Bohemian Rhapsody',
      originalArtist: 'Queen',
    },
    versions: [],
    ...overrides,
  } as unknown as LibraryEntry;
}

function tab(overrides: Partial<MusicTab> = {}): MusicTab {
  return {
    id: 't1',
    title: 'All',
    autoTitle: false,
    config: {
      searchConfig: {
        searchMode: 'repertoire',
        target: { mode: 'me' },
        dataFilterActive: false,
      },
      searchQuery: '',
    },
    ...overrides,
  };
}

function setup(state: Partial<MusicLibraryState> = {}) {
  const library: Signal<MusicLibraryState> = signal({
    entries: state.entries ?? [],
    tabs: state.tabs ?? [tab()],
    activeTabId: state.activeTabId ?? 't1',
    activeConfigId: state.activeConfigId ?? null,
    savedTabConfigs: state.savedTabConfigs ?? [],
    crossContext: state.crossContext,
  });

  TestBed.configureTestingModule({
    providers: [
      MusicLibrarySelectorService,
      { provide: MusicLibraryStateService, useValue: { library } },
    ],
  });

  return { selector: TestBed.inject(MusicLibrarySelectorService) };
}

describe('MusicLibrarySelectorService', () => {
  afterEach(() => TestBed.resetTestingModule());

  describe('activeEntries — search query', () => {
    it('returns all entries when no query', () => {
      const { selector } = setup({
        entries: [
          entry({ id: 'repEntry_e1' }),
          entry({
            id: 'repEntry_e2',
            reference: {
              id: 'r2',
              title: 'Yesterday',
              originalArtist: 'Beatles',
            } as never,
          }),
        ],
      });
      expect(selector.activeEntries()).toHaveLength(2);
    });

    it('fuzzy matches on title', () => {
      const { selector } = setup({
        entries: [
          entry({
            id: 'repEntry_e1',
            reference: {
              id: 'r1',
              title: 'Bohemian Rhapsody',
              originalArtist: 'Queen',
            } as never,
          }),
          entry({
            id: 'repEntry_e2',
            reference: {
              id: 'r2',
              title: 'Yesterday',
              originalArtist: 'Beatles',
            } as never,
          }),
        ],
        tabs: [tab({ config: { ...tab().config, searchQuery: 'bhrp' } })],
      });
      expect(selector.activeEntries().map((e) => e.id)).toEqual([
        'repEntry_e1',
      ]);
    });

    it('fuzzy matches on originalArtist', () => {
      const { selector } = setup({
        entries: [
          entry({
            id: 'repEntry_e1',
            reference: {
              id: 'r1',
              title: 'X',
              originalArtist: 'Queen',
            } as never,
          }),
          entry({
            id: 'repEntry_e2',
            reference: {
              id: 'r2',
              title: 'Y',
              originalArtist: 'Beatles',
            } as never,
          }),
        ],
        tabs: [tab({ config: { ...tab().config, searchQuery: 'btl' } })],
      });
      expect(selector.activeEntries().map((e) => e.id)).toEqual([
        'repEntry_e2',
      ]);
    });

    it('is case insensitive', () => {
      const { selector } = setup({
        entries: [entry({ id: 'repEntry_e1' })],
        tabs: [tab({ config: { ...tab().config, searchQuery: 'BOHEMIAN' } })],
      });
      expect(selector.activeEntries()).toHaveLength(1);
    });

    it('drops non-matching entries', () => {
      const { selector } = setup({
        entries: [entry({ id: 'repEntry_e1' })],
        tabs: [
          tab({ config: { ...tab().config, searchQuery: 'nosuchtrack' } }),
        ],
      });
      expect(selector.activeEntries()).toHaveLength(0);
    });
  });

  describe('activeEntries — data filter', () => {
    it('is a no-op when dataFilterActive is false, even with a filter present', () => {
      const { selector } = setup({
        entries: [entry({ versions: [version({ genre: Genre.Rock })] })],
        tabs: [
          tab({
            config: {
              searchConfig: {
                searchMode: 'repertoire',
                target: { mode: 'me' },
                dataFilterActive: false,
                dataFilter: { genres: [Genre.Pop] as never },
              },
              searchQuery: '',
            },
          }),
        ],
      });
      expect(selector.activeEntries()).toHaveLength(1);
    });

    it('keeps entries where at least one version matches the genre filter', () => {
      const { selector } = setup({
        entries: [
          entry({
            id: 'repEntry_e1',
            versions: [version({ genre: Genre.Pop })],
          }),
          entry({
            id: 'repEntry_e2',
            versions: [version({ genre: Genre.Rock })],
          }),
        ],
        tabs: [
          tab({
            config: {
              searchConfig: {
                searchMode: 'repertoire',
                target: { mode: 'me' },
                dataFilterActive: true,
                dataFilter: { genres: [Genre.Pop] as never },
              },
              searchQuery: '',
            },
          }),
        ],
      });
      expect(selector.activeEntries().map((e) => e.id)).toEqual([
        'repEntry_e1',
      ]);
    });

    it('filters by bpm range via favorite track analysis', () => {
      const { selector } = setup({
        entries: [
          entry({
            id: 'repEntry_slow',
            versions: [version({ tracks: [analysedTrack({ bpm: 70 })] })],
          }),
          entry({
            id: 'repEntry_fast',
            versions: [version({ tracks: [analysedTrack({ bpm: 140 })] })],
          }),
        ],
        tabs: [
          tab({
            config: {
              searchConfig: {
                searchMode: 'repertoire',
                target: { mode: 'me' },
                dataFilterActive: true,
                dataFilter: { bpm: { min: 100, max: 150 } },
              },
              searchQuery: '',
            },
          }),
        ],
      });
      expect(selector.activeEntries().map((e) => e.id)).toEqual([
        'repEntry_fast',
      ]);
    });

    it('combines data filter and search query', () => {
      const { selector } = setup({
        entries: [
          entry({
            id: 'repEntry_e1',
            reference: {
              id: 'r1',
              title: 'Bohemian Rhapsody',
              originalArtist: 'Queen',
            } as never,
            versions: [version({ genre: Genre.Rock })],
          }),
          entry({
            id: 'repEntry_e2',
            reference: {
              id: 'r2',
              title: 'Bohemian Like You',
              originalArtist: 'Dandy',
            } as never,
            versions: [version({ genre: Genre.Pop })],
          }),
        ],
        tabs: [
          tab({
            config: {
              searchConfig: {
                searchMode: 'repertoire',
                target: { mode: 'me' },
                dataFilterActive: true,
                dataFilter: { genres: [Genre.Rock] as never },
              },
              searchQuery: 'bohemian',
            },
          }),
        ],
      });
      expect(selector.activeEntries().map((e) => e.id)).toEqual([
        'repEntry_e1',
      ]);
    });
  });

  describe('stats', () => {
    it('totalEntries / totalVersions reflect the state', () => {
      const { selector } = setup({
        entries: [
          entry({ id: 'repEntry_e1', versions: [version(), version()] }),
          entry({ id: 'repEntry_e2', versions: [version()] }),
        ],
      });
      expect(selector.totalEntries()).toBe(2);
      expect(selector.totalVersions()).toBe(3);
    });

    it('averageMastery rounds to 1 decimal', () => {
      const { selector } = setup({
        entries: [
          entry({
            versions: [
              version({ mastery: 3 as Rating }),
              version({ mastery: 4 as Rating }),
              version({ mastery: 5 as Rating }),
            ],
          }),
        ],
      });
      expect(selector.averageMastery()).toBe(4);
    });

    it('averageQuality ignores versions with no analysed favorite track', () => {
      const { selector } = setup({
        entries: [
          entry({
            versions: [
              version({ tracks: [analysedTrack({ quality: 5 as never })] }),
              version({ tracks: [] }),
            ],
          }),
        ],
      });
      expect(selector.averageQuality()).toBe(5);
    });
  });

  describe('lookup helpers', () => {
    it('findEntry returns the entry with the matching id', () => {
      const { selector } = setup({
        entries: [entry({ id: 'repEntry_e1' }), entry({ id: 'repEntry_e2' })],
      });
      expect(selector.findEntry('repEntry_e2')?.id).toBe('repEntry_e2');
      expect(selector.findEntry('missing')).toBeUndefined();
    });

    it('findEntryByRefId returns the entry whose reference has the id', () => {
      const { selector } = setup({
        entries: [
          entry({
            id: 'repEntry_e1',
            reference: { id: 'r1', title: '', originalArtist: '' } as never,
          }),
        ],
      });
      expect(selector.findEntryByRefId('r1')?.id).toBe('repEntry_e1');
      expect(selector.findEntryByRefId('missing')).toBeUndefined();
    });
  });

  describe('static track helpers', () => {
    it('favoriteTrack returns the first favorite track on the version', () => {
      const v = version({
        tracks: [
          track({ id: 'track_a', favorite: false }),
          track({ id: 'track_b', favorite: true }),
        ],
      });
      expect(MusicLibrarySelectorService.favoriteTrack(v)?.id).toBe('track_b');
    });

    it('favoriteKey appends "m" on minor scale', () => {
      const v = version({
        tracks: [analysedTrack({ key: 'A', keyScale: 'minor' })],
      });
      expect(MusicLibrarySelectorService.favoriteKey(v)).toBe('Am');
    });

    it('favoriteDuration falls back to track.durationSeconds when no analysis', () => {
      const v = version({
        tracks: [track({ favorite: true, durationSeconds: 100 } as never)],
      });
      expect(MusicLibrarySelectorService.favoriteDuration(v)).toBe(100);
    });
  });
});
