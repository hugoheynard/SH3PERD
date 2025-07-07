import type { TCoreServices } from '../createCoreServices.js';
import type { TCoreRepositories } from '../createCoreRepositories.js';
import type { ClientSession } from 'mongodb';
import type { TMusicReferenceDomainModel } from '@sh3pherd/shared-types';
import { createFuzzySearchMusicRefUseCase } from '../../../music/useCases/createFuzzySearchMusicRefUseCase.js';

export type TMusicReferencesUseCases = {
  dynamicSearchMusicReferences: (searchQuery: { title: string; artist: string }) => Promise<TMusicReferenceDomainModel[]>;
}


export const createMusicReferencesUseCases = (deps: {
  services: TCoreServices;
  repositories: TCoreRepositories;
  session?: ClientSession;
}): TMusicReferencesUseCases => {

  const { musicReferenceRepository} = deps.repositories;

  const dynamicSearchMusicReferences = createFuzzySearchMusicRefUseCase({
    textSearchInMusicReferencesFn: (searchValue: string) => musicReferenceRepository.findByTextSearch(searchValue)
  })

  return {
    dynamicSearchMusicReferences,
  };
};