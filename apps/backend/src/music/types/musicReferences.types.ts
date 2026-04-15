import type { TMusicReferenceDomainModel, TMusicReferenceId } from '@sh3pherd/shared-types';

export type IMusicReferenceRepository = {
  save(document: TMusicReferenceDomainModel): Promise<boolean>;
  findAll(): Promise<TMusicReferenceDomainModel[]>;
  findByIds(ids: TMusicReferenceId[]): Promise<TMusicReferenceDomainModel[]>;
  findByExactTitleAndArtist(
    title: string,
    artist: string,
  ): Promise<TMusicReferenceDomainModel | null>;
  findByTextSearch(searchValue: string): Promise<TMusicReferenceDomainModel[]>;
};
