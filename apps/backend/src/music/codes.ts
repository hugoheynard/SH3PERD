import type { ApiResponse } from '@sh3pherd/shared-types';

export type ApiMessage = {
  code: string;
  message: string;
};

export const MusicApiCodes = {
  MUSIC_REFERENCE_CREATED: {
    code: 'MUSIC_001',
    message: 'Music reference created successfully',
  },
  DUPLICATE: {
    code: 'MUSIC_002',
    message: 'This music reference already exists',
  },
  NOT_FOUND: {
    code: 'MUSIC_003',
    message: 'Music reference not found',
  },
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