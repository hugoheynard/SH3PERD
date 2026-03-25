export type SearchMode = 'repertoire' | 'cross' | 'shared' | 'match';
export type TargetMode = 'me' | 'single-user' | 'multiple-users';
export type Rating = 1 | 2 | 3 | 4;

export const MUSIC_GENRES = ['Pop', 'Rock', 'EDM', 'Jazz/Soul', 'Hip-Hop', 'R&B', 'Classical', 'Folk/Acoustic'] as const;
export type MusicGenre = typeof MUSIC_GENRES[number];

/**
 * Lightweight summary of an audio analysis run stored on a version.
 * Populated by AudioAnalyzerService; absent until the user analyses the track.
 * `quality` is auto-scored 1–4 from the measured metrics.
 */
export type AudioAnalysisSnapshot = {
  integratedLUFS: number;
  loudnessRange:  number;
  truePeakdBTP:   number;
  SNRdB:          number;
  clippingRatio:  number;
  quality:        Rating;
};

export interface MusicLibraryState {
  references: MusicReference[];
  repertoire: RepertoireEntry[];
  versions: MusicVersion[];
  tabs: MusicTab[];
  activeTabId: string;
}

export type MusicReference = {
  id: string;
  title: string;
  originalArtist: string;
};

export type RepertoireEntry = {
  id: string;
  referenceId: string;
  userId: string;
};

export type MusicVersion = {
  id: string;
  entryId: string;   // links to RepertoireEntry (encodes userId + referenceId)
  label: string;
  durationSeconds?: number;
  bpm?: number;
  genre: MusicGenre;
  notes?: string;
  mastery: Rating;
  energy: Rating;
  effort: Rating;
  /** True once the user has attached an audio file to this version. */
  trackUploaded: boolean;
  /** Populated by AudioAnalyzerService after the user runs analysis. */
  analysisResult?: AudioAnalysisSnapshot;
};

export type MusicTab = {
  id: string;
  title: string;
  autoTitle: boolean;
  searchConfig: MusicSearchConfig;
};

export type MusicSearchConfig = {
  searchMode: SearchMode;
  target: MusicSearchTarget;
  dataFilterActive: boolean;
  dataFilter?: MusicDataFilter;
};

export type MusicSearchTarget = {
  mode: TargetMode;
  userId?: string;
  userIds?: string[];
};

export type MusicDataFilter = {
  genres?: MusicGenre[];
  mastery?: Rating[];
  energy?: Rating[];
  effort?: Rating[];
  /** Filters on analysis-derived quality (only versions with analysisResult are matched). */
  quality?: Rating[];
};
