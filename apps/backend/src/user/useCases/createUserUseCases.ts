import type { TUseCasesFactoryGeneric } from '../../types/useCases.generic.types.js';
import type { TUserId, TUserMeViewModel, TUserPreferencesRecord } from '@sh3pherd/shared-types';
import { getUserMeUseCaseFactory } from './getUserMeUseCaseFactory.js';
import {
  type TGenericUpdateOneUseCase,
  UpdateOneUseCaseBuilder,
} from '../../utils/useCases/UpdateOneUseCaseBuilder.js';

export type TUserUseCases = {
  getUserMe: (user_id: TUserId) => Promise<TUserMeViewModel>;
  updateUserPreferences: TGenericUpdateOneUseCase<TUserPreferencesRecord>;
}

export function createUserUseCases(deps: Parameters<TUseCasesFactoryGeneric<TUserUseCases>>[0]): ReturnType<TUseCasesFactoryGeneric<TUserUseCases>>{
  const { userCredentials, userPreferences } = deps.repositories;

  // Initialize and return user-related use cases here
  return {
    getUserMe: getUserMeUseCaseFactory({ getUserMeFn: (user_id: TUserId) => userCredentials.getUserMe(user_id) }),

    updateUserPreferences: new UpdateOneUseCaseBuilder<TUserPreferencesRecord>()
      .withPermissionCheck({
        fn: async (asker_id) => asker_id !== 'user_deleted', // Example permission check
        error: 'PERMISSION_DENIED_UPDATE_USER_PREFERENCES'
      })
      .withRepo({
        fn: (input) => userPreferences.updateOne(input),
        error: 'USER_PREFERENCES_UPDATE_FAILED'
      })
      //TODO: add post processor to strip metadata
      .build()
  };
}