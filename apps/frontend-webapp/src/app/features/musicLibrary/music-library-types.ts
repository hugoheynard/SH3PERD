/**
 * Music Library feature types.
 *
 * Data types (Rating, Genre, VersionTrack, etc.) are re-exported from @sh3pherd/shared-types.
 * Only UI-specific types (state, tabs, search, cross-search) are defined here.
 */

// ─── Re-exports from shared-types (data) ────────────────────
import { Genre, VersionType } from '@sh3pherd/shared-types';
export { Genre, VersionType };
export type { TMusicRating, TGenreEnum, TTypeEnum } from '@sh3pherd/shared-types';
export type { TAudioAnalysisSnapshot } from '@sh3pherd/shared-types';
export type { TVersionTrackDomainModel } from '@sh3pherd/shared-types';
export type { TReferenceView, TVersionView, TRepertoireEntryViewModel } from '@sh3pherd/shared-types';

// ─── Aliases for brevity in templates ───────────────────────
export type Rating = import('@sh3pherd/shared-types').TMusicRating;
export type MusicGenre = import('@sh3pherd/shared-types').TGenreEnum;
export type AudioAnalysisSnapshot = import('@sh3pherd/shared-types').TAudioAnalysisSnapshot;
export type VersionTrack = import('@sh3pherd/shared-types').TVersionTrackDomainModel;
export type MusicVersion = import('@sh3pherd/shared-types').TVersionView;
export type MusicReference = import('@sh3pherd/shared-types').TReferenceView;
export type LibraryEntry = import('@sh3pherd/shared-types').TRepertoireEntryViewModel;

/** All genre values as an array — for iteration in templates. */
export const MUSIC_GENRES = Object.values(Genre) as MusicGenre[];

// ─── Generic tab system re-exports ────────────────────────────
import type { TabItem, SavedTabConfig as GenericSavedTabConfig } from '../../shared/configurable-tab-bar';
export type { TabItem } from '../../shared/configurable-tab-bar';

// ─── UI-specific types ──────────────────────────────────────

export type SearchMode = 'repertoire' | 'cross' | 'shared' | 'match';
export type TargetMode = 'me' | 'single-user' | 'multiple-users';

/** Music-specific config stored inside each generic TabItem */
export type MusicTabConfig = {
  searchConfig: MusicSearchConfig;
  searchQuery: string;
};

/** Music tab = generic TabItem parameterized with MusicTabConfig */
export type MusicTab = TabItem<MusicTabConfig>;

/** Music saved config = generic SavedTabConfig parameterized with MusicTabConfig */
export type SavedTabConfig = GenericSavedTabConfig<MusicTabConfig>;

export interface MusicLibraryState {
  entries: LibraryEntry[];
  tabs: MusicTab[];
  activeTabId: string;
  activeConfigId: string | null;
  savedTabConfigs: SavedTabConfig[];
  crossContext?: CrossSearchContext;
}

export type MusicSearchConfig = {
  searchMode: SearchMode;
  target: MusicSearchTarget;
  dataFilterActive: boolean;
  dataFilter?: MusicDataFilter;
};

export type MusicSearchTarget = {
  mode: TargetMode | 'contract';
  userId?: string;
  userIds?: string[];
  contractId?: string;
};

export type NumberRange = { min: number; max: number };

export type MusicDataFilter = {
  genres?: MusicGenre[];
  mastery?: Rating[];
  energy?: Rating[];
  effort?: Rating[];
  quality?: Rating[];
  bpm?: NumberRange;
  duration?: NumberRange;
};

/* ── Cross search ── */

export type ContractMember = {
  userId: string;
  displayName: string;
  avatarInitials: string;
};

export type CrossMemberVersion = {
  hasVersion: boolean;
  versions: Pick<MusicVersion, 'id' | 'label' | 'mastery' | 'energy' | 'effort' | 'tracks'>[];
};

export type CrossReferenceResult = {
  referenceId: string;
  title: string;
  originalArtist: string;
  members: Record<string, CrossMemberVersion>;
  compatibleCount: number;
};

export type CrossSearchContext = {
  contractId: string;
  members: ContractMember[];
  results: CrossReferenceResult[];
};
