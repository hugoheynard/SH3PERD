import type { TCreateMusicReferenceRequestDTO, TMusicReferenceDomainModel, TUserId } from '@sh3pherd/shared-types';
import { createFuzzySearchMusicRefUseCase } from '../../../music/useCases/createFuzzySearchMusicRefUseCase.js';
import { createCreateOneMusicReferenceUseCase } from '../../../music/useCases/createCreateOneMusicReferenceUseCase.js';
import type { TUseCasesFactoryGeneric } from '../../../types/useCases.generic.types.js';


export type TMusicReferencesUseCases = {
  dynamicSearchMusicReferences: (searchQuery: { title: string; artist: string }) => Promise<TMusicReferenceDomainModel[]>;
  createOne: (asker_id: TUserId, payload: TCreateMusicReferenceRequestDTO) => Promise<TMusicReferenceDomainModel>;
}


export const createMusicReferencesUseCases: TUseCasesFactoryGeneric<TMusicReferencesUseCases> = (deps) => {

  const { musicReferenceRepository} = deps.repositories;

  const dynamicSearchMusicReferences = createFuzzySearchMusicRefUseCase({
    textSearchInMusicReferencesFn: (searchValue: string) => musicReferenceRepository.findByTextSearch(searchValue)
  })

  const createOne = createCreateOneMusicReferenceUseCase({
    saveOneMusicReferenceFn: (document: TMusicReferenceDomainModel) => musicReferenceRepository.saveOne(document)
  })

  return {
    dynamicSearchMusicReferences,
    createOne
  };
};