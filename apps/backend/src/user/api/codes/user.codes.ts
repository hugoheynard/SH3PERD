import type { TApiMessage } from '@sh3pherd/shared-types';

export const USER_CODES_SUCCESS = {
  GET_USER_ME: {
    code: 'GET_USER_ME_SUCCESS',
    message: 'Session User information retrieved successfully',
  },
} as const satisfies Record<string, TApiMessage>



export const USER_CODES_ERROR = {
  GET_USER_ME_UNAUTHORIZED: {
    code: 'USER_201',
    message: 'Unauthorized: Invalid or missing authentication token',
  },
  GET_USER_ME_NOT_FOUND: {
    code: 'USER_404',
    message: 'User not found',
  },
} as const satisfies Record<string, TApiMessage>