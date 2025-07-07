import type { TMusicReferenceDomainModel } from '@sh3pherd/shared-types';
import type { ClientSession } from 'mongodb';


//REPOSITORY TYPES
export type TSaveOneMusicReferenceFn = (document: TMusicReferenceDomainModel, session?: ClientSession) => Promise<boolean>;
export type TFindOneMusicReferenceByFilterFn = (filter: Partial<TMusicReferenceDomainModel>) => Promise<TMusicReferenceDomainModel | null>;
export type TFindManyMusicReferenceByFilterFn = (filter: any) => Promise<TMusicReferenceDomainModel[] | null>;
export type TFindMusicReferenceByTextSearchFn = (searchValue: string) => Promise<TMusicReferenceDomainModel[]>;

export type IMusicReferenceRepository = {
  saveOne: TSaveOneMusicReferenceFn;
  findOne: TFindOneMusicReferenceByFilterFn;
  findMany: TFindManyMusicReferenceByFilterFn;
  findAll: () => Promise<TMusicReferenceDomainModel[]>;
  findByTextSearch: TFindMusicReferenceByTextSearchFn;
};
