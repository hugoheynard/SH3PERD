import type { TCreateMusicReferenceRequestDTO, TMusicReferenceDomainModel, TUserId } from '@sh3pherd/shared-types';
import { createFuzzySearchMusicRefUseCase } from './createFuzzySearchMusicRefUseCase.js';
import { createCreateOneMusicReferenceUseCase } from './createCreateOneMusicReferenceUseCase.js';
import type { TUseCasesFactoryGeneric } from '../../../types/useCases.generic.types.js';


export type TMusicReferencesUseCases = {
  dynamicSearchMusicReferences: (searchQuery: { title: string; artist: string }) => Promise<TMusicReferenceDomainModel[]>;
  createOne: (asker_id: TUserId, payload: TCreateMusicReferenceRequestDTO) => Promise<TMusicReferenceDomainModel>;
}


export const createMusicReferencesUseCases: TUseCasesFactoryGeneric<TMusicReferencesUseCases> = (deps) => {

  const { musicReference} = deps.repositories;

  const dynamicSearchMusicReferences = createFuzzySearchMusicRefUseCase({
    textSearchInMusicReferencesFn: (searchValue: string) => musicReference.findByTextSearch(searchValue)
  })

  const createOne = createCreateOneMusicReferenceUseCase({
    saveOneMusicReferenceFn: (document: TMusicReferenceDomainModel) => musicReference.saveOne(document)
  })

  return {
    dynamicSearchMusicReferences,
    createOne
  };
};