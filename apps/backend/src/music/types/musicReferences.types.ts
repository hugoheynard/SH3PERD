import type { TUserId } from '../../user/types/user.domain.types.js';

//DOMAIN TYPES
export type TMusicReferenceId = `musicReference_${string}`;

export type TMusicReferenceDomainModel = {
  music_id: TMusicReferenceId,
  title: string;
  artist: string;
  created_at: Date;
  updated_at: Date;
  created_by: TUserId;
}


//REPOSITORY TYPES
export type TSaveMusicReferenceFn = (input: { musicRefDomainModel: TMusicReferenceDomainModel }) => Promise<boolean>;
export type TFindMusicReferenceByFilterFn<T> = (filter: T) => Promise<TMusicReferenceDomainModel[] | null>;


export interface IMusicReferenceRepository<T> {
  save: TSaveMusicReferenceFn;
  findOne: TFindMusicReferenceByFilterFn<T>;
  findMany: TFindMusicReferenceByFilterFn<T>;
  findAll: () => Promise<TMusicReferenceDomainModel[]>;
}