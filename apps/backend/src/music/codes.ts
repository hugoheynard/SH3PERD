import type { ApiResponse } from '@sh3pherd/shared-types';

export type ApiMessage = {
  code: string;
  message: string;
};

export const MusicApiCodes = {
  MUSIC_REFERENCE_CREATED: {
    code: 'MUSIC_101_S',
    message: 'Music reference created successfully',
  },
  DUPLICATE: {
    code: 'MUSIC_102_F',
    message: 'This music reference already exists',
  },
  NOT_FOUND: {
    code: 'MUSIC_103_F',
    message: 'Music reference not found',
  },
  MUSIC_VERSION_CREATED: {
    code: 'MUSIC_201_S',
    message: 'Music version created successfully',
  },
  MUSIC_VERSION_CREATION_REPO_FAIL: {
    code: 'MUSIC_201_F',
    message: 'Music version creation failed, repository technical error',
  },
  MUSIC_VERSION_CREATION_UC_FAIL: {
    code: 'MUSIC_202_F',
    message: 'Music version creation failed, use case technical error',
  },
  MUSIC_LIBRARY_SINGLE_USER_SUCCESS: {
    code: 'MUSIC_301_S',
    message: 'Music library fetched successfully for single user',
  }
} as const satisfies Record<string, ApiMessage>;


export const apiCodes = {
  music: MusicApiCodes
}

export function buildApiResponse<T>(entry: ApiMessage, data?: T): ApiResponse<T> {
  return {
    code: entry.code,
    message: entry.message,
    data,
  };
}