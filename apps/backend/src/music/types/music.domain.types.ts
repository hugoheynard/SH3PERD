import type { TUserId } from '../../user/types/user.domain.types.js';
import type { TMusicReferenceId } from './musicReferences.types.js';

export type TMusicGenres = 'jazz' | 'pop' | 'rock' | 'soul' | 'EDM';
export type TMusicKeys =
  | 'C'
  | 'C#'
  | 'D'
  | 'D#'
  | 'E'
  | 'F'
  | 'F#'
  | 'G'
  | 'G#'
  | 'A'
  | 'A#'
  | 'B'
  | 'Cm'
  | 'C#m'
  | 'Dm'
  | 'D#m'
  | 'Em'
  | 'Fm'
  | 'F#m'
  | 'Gm'
  | 'G#m'
  | 'Am'
  | 'A#m'
  | 'Bm';
export type TVersionEnergy = 1 | 2 | 3 | 4;
export type TVersionType = 'original' | 'cover' | 'remix';
export type TMasteryLevel = 1 | 2 | 3 | 4;
export type TEffortLevel = 1 | 2 | 3 | 4;

export type TMusicVersionId = `musicVersion_${string}`;

export type TMusicVersionDomainModel = {
  musicVersion_id: TMusicVersionId;
  music_id: TMusicReferenceId;
  title_override?: string;
  artist_override?: string;
  genre: TMusicGenres;
  type: TVersionType;
  duration?: number;
  energy?: TVersionEnergy;
  pitch?: number;
  bpm?: number;
  key?: TMusicKeys;
  created_at: Date;
  updated_at: Date;
  created_by: TUserId;
};

export type TMusicRepertoireEntryDomainModel = {
  musicVersion_id: TMusicVersionId;
  performer_id: TUserId;
  effort: TEffortLevel;
  mastery: TMasteryLevel;
  created_at: Date;
  updated_at: Date;
  created_by: TUserId;
};

export type TUserRepertoireTableRow = {
  musicVersion_id: TMusicVersionId;
  title: string;
  artist: string;
  title_override?: string;
  artist_override?: string;
  type: TVersionType;
  genre: TMusicGenres;
  duration?: number;
  key?: TMusicKeys;
  pitch?: number;
  bpm?: number;
  energy?: TVersionEnergy;
  effort: TEffortLevel;
  mastery: TMasteryLevel;
};
