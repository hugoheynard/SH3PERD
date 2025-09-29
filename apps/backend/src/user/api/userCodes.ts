import type { ApiMessage } from '../../music/codes.js';

export const USER_API_CODES_SUCCESS = {
  GET_USER_ME: {
    code: 'USER_101',
    message: 'Session User information retrieved successfully',
  }
} as const satisfies Record<string, ApiMessage>



export const USER_API_CODES_ERROR = {
  GET_USER_ME_UNAUTHORIZED: {
    code: 'USER_201',
    message: 'Unauthorized: Invalid or missing authentication token',
  },
  GET_USER_ME_NOT_FOUND: {
    code: 'USER_404',
    message: 'User not found',
  },
} as const satisfies Record<string, ApiMessage>