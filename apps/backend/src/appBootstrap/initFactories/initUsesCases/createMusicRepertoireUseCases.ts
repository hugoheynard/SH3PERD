import { TechnicalError } from '../../../utils/errorManagement/errorClasses/TechnicalError.js';
import { createGetMusicRepertoireByUserIdUseCase } from '../../../music/useCases/createGetMusicRepertoireByUserIdUseCase.js';
import type { TMusicRepertoireUseCases } from '../../../music/types/musicRepertoire.useCases.types.js';
import type { TCoreRepositories } from '../createCoreRepositories.js';

export const createMusicRepertoireUseCases = (deps: {
  services: any;
  repositories: TCoreRepositories;
}): TMusicRepertoireUseCases => {
  try {
    const { musicRepertoireRepository } = deps.repositories;

    const getMusicRepertoireByUserId = createGetMusicRepertoireByUserIdUseCase({
      findMusicRepertoireByUserIdFn: musicRepertoireRepository.findRepertoireByUserId,
    });

    return {
      getMusicRepertoireByUserId,
    };
  } catch (err) {
    throw new TechnicalError(
      `Error creating user repertoire use cases: ${err}`,
      'USER_REPERTOIRE_USE_CASES_CREATION_FAILED',
      500,
    );
  }
};
