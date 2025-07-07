import type { TMusicReferenceDomainModel } from '@sh3pherd/shared-types';
import type { TFindMusicReferenceByTextSearchFn } from '../types/musicReferences.types.js';
import { TechnicalError } from '../../utils/errorManagement/errorClasses/TechnicalError.js';



/**
 * Creates a use case for fuzzy searching music references.
 * @param deps
 */
export const createFuzzySearchMusicRefUseCase = (deps: {
  textSearchInMusicReferencesFn: TFindMusicReferenceByTextSearchFn;
}) => {
  const { textSearchInMusicReferencesFn } = deps;

  return async (searchQuery: { title: string; artist: string }): Promise<TMusicReferenceDomainModel[]> => {
    try {
      return textSearchInMusicReferencesFn(`${searchQuery.title} ${searchQuery.artist}`);
    } catch (e) {
      throw new TechnicalError('Error while fuzzy searching music references', 'MUSIC_REFERENCE_FUZZY_SEARCH_ERROR');
    }
    
  };
}