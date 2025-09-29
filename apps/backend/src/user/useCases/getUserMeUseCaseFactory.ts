import type { TUserMeViewModel, TUserId } from '@sh3pherd/shared-types';

export const getUserMeUseCaseFactory = (deps: {
  getUserMeFn: (user_id: TUserId) => Promise<TUserMeViewModel>;
}) => {

  const { getUserMeFn } = deps;

  return async (user_id: TUserId): Promise<TUserMeViewModel> => {

    const result = await getUserMeFn(user_id);

    if(!result) {
      throw new Error('USER_NOT_FOUND');
    }

    return result;
  }
};