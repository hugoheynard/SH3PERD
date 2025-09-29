import type { TUseCasesFactoryGeneric } from '../../types/useCases.generic.types.js';
import type { TUserId, TUserMeViewModel, TUserPreferencesDomainModel } from '@sh3pherd/shared-types';
import { getUserMeUseCaseFactory } from './getUserMeUseCaseFactory.js';
import {
  type TGenericUpdateOneUseCase,
  UpdateOneUseCaseBuilder,
} from '../../utils/useCases/UpdateOneUseCaseBuilder.js';

export type TUserUseCases = {
  getUserMe: (user_id: TUserId) => Promise<TUserMeViewModel>;
  //deleteUser?: () => Promise<void>;
  updateUserPreferences: TGenericUpdateOneUseCase<TUserPreferencesDomainModel>;
}

export const createUserUseCases: TUseCasesFactoryGeneric<TUserUseCases> = (deps) => {
  const { userCredentialsRepository, userPreferencesRepository } = deps.repositories;

  // Initialize and return user-related use cases here
  return {
    getUserMe: getUserMeUseCaseFactory({ getUserMeFn: (user_id: TUserId) => userCredentialsRepository.getUserMe(user_id) }),
      deleteUser: () => {
      // Logic to soft delete a user
    },
    updateUserPreferences: new UpdateOneUseCaseBuilder<TUserPreferencesDomainModel>()
      .withPermissionCheck({
        fn: async (asker_id) => asker_id !== 'user_deleted', // Example permission check
        error: 'PERMISSION_DENIED_UPDATE_USER_PREFERENCES'
      })
      .withRepoUpdateFn({
        fn: (input) => userPreferencesRepository.findOneAndUpdateDoc(input),
        error: 'USER_PREFERENCES_UPDATE_FAILED'
      })
      .build()
  };
}