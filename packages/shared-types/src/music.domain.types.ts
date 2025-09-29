import type { TUserId } from './user/user.domain.js';
import type { TMusicGrade } from './music.domain.schemas.js';
import type { TMusicVersionDomainModel, TMusicVersionId } from './music.versions.js';
import type { TMusicReferenceDomainModel } from './music-references.js';
import type { ApiResponse } from './api.types.js';


export type TMusicRepertoireEntry_id = `musicRepertoireEntry_${string}`;
export type TMusicRepertoireEntryDomainModel = {
  musicVersion_id: TMusicVersionId;
  user_id: TUserId;
  energy: TMusicGrade;
  effort: TMusicGrade;
  mastery: TMusicGrade;
  affinity: TMusicGrade;
  created_at: Date;
  updated_at: Date;
  created_by: TUserId;
}


export type TUserMusicLibraryItem = {
  version: TMusicVersionDomainModel;
  repertoireEntry?: TMusicRepertoireEntryDomainModel;
  reference?: TMusicReferenceDomainModel;
  source: 'owned' | 'borrowed';
}

export type TMusicLibraryFilter = {
  version?: Partial<TMusicVersionDomainModel>
  repertoireEntry?: Partial<TMusicRepertoireEntryDomainModel>;
}

export type TSingleUserMusicLibraryRequestDTO = {
  target_id: TUserId;
  filter?: TMusicLibraryFilter;
}

export type TUserMusicLibrary = Record<TUserId, TUserMusicLibraryItem[]>;
export type TUserMusicLibraryResponseDTO = ApiResponse<TUserMusicLibrary>;