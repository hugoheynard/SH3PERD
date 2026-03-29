import { z } from 'zod';
import { SMusicVersionId, SMusicReferenceId, SUserId } from './ids.js';
import type { TMusicVersionId, TMusicReferenceId, TUserId } from './ids.js';
import { SGenreEnum, STypeEnum, SRating } from './music.domain.schemas.js';
import type { TGenreEnum, TTypeEnum, TRating } from './music.domain.schemas.js';
import { SVersionTrackDomainModel } from './music-tracks.js';
import type { TVersionTrackDomainModel } from './music-tracks.js';

// ─── Domain model ──────────────────────────────────────────

/** A user's rendition of a music reference (cover, pitch variant, acoustic…). */
export interface TMusicVersionDomainModel {
  id:                TMusicVersionId;
  musicReference_id: TMusicReferenceId;
  owner_id:          TUserId;
  label:             string;
  genre:             TGenreEnum;
  type:              TTypeEnum;
  bpm:               number | null;
  pitch:             number | null;
  notes?:            string;
  mastery:           TRating;
  energy:            TRating;
  effort:            TRating;
  tracks:            TVersionTrackDomainModel[];
}

const _SMusicVersionDomainModel = z.object({
  id:                SMusicVersionId,
  musicReference_id: SMusicReferenceId,
  owner_id:          SUserId,
  label:             z.string().min(1),
  genre:             SGenreEnum,
  type:              STypeEnum,
  bpm:               z.number().nullable(),
  pitch:             z.number().nullable(),
  notes:             z.string().optional(),
  mastery:           SRating,
  energy:            SRating,
  effort:            SRating,
  tracks:            z.array(SVersionTrackDomainModel),
});

export const SMusicVersionDomainModel = _SMusicVersionDomainModel;


// ─── DTOs ──────────────────────────────────────────────────

export interface TCreateMusicVersionPayload {
  musicReference_id: TMusicReferenceId;
  label:             string;
  genre:             TGenreEnum;
  type:              TTypeEnum;
  bpm:               number | null;
  pitch:             number | null;
  notes?:            string;
  mastery:           TRating;
  energy:            TRating;
  effort:            TRating;
}

export const SCreateMusicVersionPayload = _SMusicVersionDomainModel.omit({
  id: true,
  owner_id: true,
  tracks: true,
});

export interface TUpdateMusicVersionPayload {
  label?:   string;
  genre?:   TGenreEnum;
  type?:    TTypeEnum;
  bpm?:     number | null;
  pitch?:   number | null;
  notes?:   string;
  mastery?: TRating;
  energy?:  TRating;
  effort?:  TRating;
}

export const SUpdateMusicVersionPayload = _SMusicVersionDomainModel
  .pick({
    label: true,
    genre: true,
    type: true,
    bpm: true,
    pitch: true,
    notes: true,
    mastery: true,
    energy: true,
    effort: true,
  })
  .partial();


/** @deprecated Use TMusicVersionId from ids.ts */
export const SMusicVersion_id = SMusicVersionId;
