
import type { TMusicReferenceDomainModel } from './music-references.js';
import type { TMusicVersionDomainModel } from './music.versions.js';
import type { TMusicRepertoireEntryDomainModel } from './music-repertoire.js';
import type { TRepertoireEntryId, TMusicReferenceId, TMusicVersionId } from './ids.js';
import type { TVersionTrackDomainModel, TRating } from './music-tracks.js';
import type { TGenreEnum, TTypeEnum } from './music.domain.schemas.js';


// ─── View model sub-types (frontend-friendly, no backend fields) ──

/** Reference as seen by the frontend — no owner_id. */
export interface TReferenceView {
  id:             TMusicReferenceId;
  title:          string;
  originalArtist: string;
}

/** Version as seen by the frontend — no owner_id, no musicReference_id. */
export interface TVersionView {
  id:       TMusicVersionId;
  label:    string;
  genre:    TGenreEnum;
  type:     TTypeEnum;
  bpm:      number | null;
  pitch:    number | null;
  notes?:   string;
  mastery:  TRating;
  energy:   TRating;
  effort:   TRating;
  tracks:   TVersionTrackDomainModel[];
}


// ─── Aggregated view models ────────────────────────────────

/**
 * Entry-centric view model — one item per repertoire entry.
 * This is what the frontend consumes: a reference + all its versions grouped.
 */
export interface TRepertoireEntryViewModel {
  id:        TRepertoireEntryId;
  reference: TReferenceView;
  versions:  TVersionView[];
}

/** The full user library — array of entry view models. */
export interface TUserMusicLibraryViewModel {
  entries:        TRepertoireEntryViewModel[];
  totalEntries:   number;
  totalVersions:  number;
}


// ─── Deprecated ─────────────────────────────────────────────

/**
 * Flat view — one row per version, used by the MongoDB aggregation pipeline.
 * @deprecated Prefer TRepertoireEntryViewModel for frontend consumption.
 */
export type TUserMusicLibraryItem = {
  version: TMusicVersionDomainModel;
  repertoireEntry?: TMusicRepertoireEntryDomainModel;
  reference?: TMusicReferenceDomainModel;
  source: 'owned' | 'borrowed';
};
