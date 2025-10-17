import type { TUserId } from './user/user.domain.js';
import type {
  TEffortLevel,
  TMasteryLevel,
  TMusicGenres,
  TMusicKeys,
  TVersionEnergy,
  TVersionType,
} from './music.domain.types.js';
import type { TMusicVersionId } from './music.versions.js';

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



//--- DTOs ---//
export type TGetMusicRepertoireByFilterRequestDTO = {
  asker_user_id: TUserId;
  target_user_id: TUserId | TUserId[];
  filter: any;
}

export type TGetMusicRepertoireByFilterResponseDTO = Record<TUserId, TUserRepertoireTableRow[]>