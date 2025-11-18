import type { TApiMessage } from '@sh3pherd/shared-types';

export const USER_PROFILE_SUCCESS = {
  GET_USER_PROFILE: {
    code: 'USER_PROFILE_FETCH_SUCCESS',
    message: 'User profile fetched successfully',
  },
  UPDATE_USER_PROFILE: {
    code: 'USER_PROFILE_UPDATE_SUCCESS',
    message: 'User profile updated successfully',
  },
} as const satisfies Record<string, TApiMessage>;