import type { TUserId } from './user/user.domain.js';
import type { TMusicReferenceDomainModel  } from './music-references.js';
import type { ApiResponse } from './api.types.js';
import type { TMusicVersionDomainModel } from './music.versions.js';
import type { TMusicRepertoireEntryDomainModel } from './music-repertoire.js';


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