import { BusinessError } from '../../utils/errorManagement/errorClasses/BusinessError.js';

import type { TFindMusicRepertoireByUserIdFn } from '../types/musicRepertoire.core.types.js';
import type { TGetMusicRepertoireUseCaseFn } from '../types/musicRepertoire.useCases.types.js';

export const createGetMusicRepertoireByUserIdUseCase = (deps: {
  findMusicRepertoireByUserIdFn: TFindMusicRepertoireByUserIdFn;
}): TGetMusicRepertoireUseCaseFn => {
  return async (requestDTO) => {
    const { asker_user_id, target_user_id } = requestDTO;

    if (!asker_user_id) {
      throw new BusinessError('GET_USER_REPERTOIRE_FAILED', 'No asker user_id in request', 400);
    }

    if (!target_user_id) {
      throw new BusinessError('GET_USER_REPERTOIRE_FAILED', 'No target user_id in request', 400);
    }

    //TODO: permissions on asker_user_id

    const rawResults = await deps.findMusicRepertoireByUserIdFn({ user_id: target_user_id });

    return new Map(rawResults.map((entry) => [entry.user_id, entry.repertoire]));
  };
};
