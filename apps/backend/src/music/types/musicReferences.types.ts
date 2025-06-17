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
export type TSaveOneMusicReferenceFn = (document: TMusicReferenceDomainModel) => Promise<boolean>;
export type TFindOneMusicReferenceByFilterFn = (filter: any) => Promise<TMusicReferenceDomainModel | null>;
export type TFindManyMusicReferenceByFilterFn = (filter: any) => Promise<TMusicReferenceDomainModel[] | null>;


export interface IMusicReferenceRepository {
  saveOne: TSaveOneMusicReferenceFn;
  findOne: TFindOneMusicReferenceByFilterFn;
  findMany: TFindManyMusicReferenceByFilterFn;
  findAll: () => Promise<TMusicReferenceDomainModel[]>;
}