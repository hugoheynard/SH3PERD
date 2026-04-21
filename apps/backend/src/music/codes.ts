import type { TApiMessage } from '@sh3pherd/shared-types';

export const MusicApiCodes = {
  MUSIC_REFERENCE_CREATED: {
    code: 'MUSIC_REFERENCE_CREATED',
    message: 'Music reference created successfully',
  },
  MUSIC_REFERENCES_SEARCHED: {
    code: 'MUSIC_REFERENCES_SEARCHED',
    message: 'Music references searched successfully',
  },
  DUPLICATE: {
    code: 'MUSIC_REFERENCE_DUPLICATE',
    message: 'This music reference already exists',
  },
  NOT_FOUND: {
    code: 'MUSIC_REFERENCE_NOT_FOUND',
    message: 'Music reference not found',
  },
  MUSIC_VERSION_CREATED: {
    code: 'MUSIC_VERSION_CREATED',
    message: 'Music version created successfully',
  },
  MUSIC_VERSION_UPDATED: {
    code: 'MUSIC_VERSION_UPDATED',
    message: 'Music version updated successfully',
  },
  MUSIC_VERSION_DELETED: {
    code: 'MUSIC_VERSION_DELETED',
    message: 'Music version deleted successfully',
  },
  MUSIC_VERSION_CREATION_REPO_FAIL: {
    code: 'MUSIC_VERSION_CREATION_REPO_FAIL',
    message: 'Music version creation failed, repository technical error',
  },
  MUSIC_VERSION_CREATION_UC_FAIL: {
    code: 'MUSIC_VERSION_CREATION_UC_FAIL',
    message: 'Music version creation failed, use case technical error',
  },
  MUSIC_LIBRARY_SINGLE_USER_SUCCESS: {
    code: 'MUSIC_LIBRARY_FETCHED',
    message: 'Music library fetched successfully for single user',
  },
  REPERTOIRE_ENTRY_CREATED: {
    code: 'REPERTOIRE_ENTRY_CREATED',
    message: 'Repertoire entry created successfully',
  },
  REPERTOIRE_ENTRY_DELETED: {
    code: 'REPERTOIRE_ENTRY_DELETED',
    message: 'Repertoire entry deleted successfully',
  },
  REPERTOIRE_ENTRIES_FETCHED: {
    code: 'REPERTOIRE_ENTRIES_FETCHED',
    message: 'Repertoire entries fetched successfully',
  },
  TAB_CONFIGS_FETCHED: {
    code: 'TAB_CONFIGS_FETCHED',
    message: 'Tab configs fetched successfully',
  },
  TAB_CONFIGS_SAVED: {
    code: 'TAB_CONFIGS_SAVED',
    message: 'Tab configs saved successfully',
  },
  TAB_CONFIGS_DELETED: {
    code: 'TAB_CONFIGS_DELETED',
    message: 'Tab configs deleted successfully',
  },
  TRACK_UPLOADED: {
    code: 'TRACK_UPLOADED',
    message: 'Track uploaded successfully',
  },
  TRACK_DELETED: {
    code: 'TRACK_DELETED',
    message: 'Track deleted successfully',
  },
  TRACK_FAVORITE_SET: {
    code: 'TRACK_FAVORITE_SET',
    message: 'Track favorite updated successfully',
  },
  TRACK_DOWNLOAD_URL: {
    code: 'TRACK_DOWNLOAD_URL',
    message: 'Track download URL generated successfully',
  },
  TRACK_MASTERED: {
    code: 'TRACK_MASTERED',
    message: 'Track mastered successfully',
  },
  VERSION_PITCH_SHIFTED: {
    code: 'VERSION_PITCH_SHIFTED',
    message: 'Version pitch-shifted successfully',
  },
  TRACK_AI_MASTERED: {
    code: 'TRACK_AI_MASTERED',
    message: 'Track AI-mastered successfully',
  },
  CROSS_LIBRARY_FETCHED: {
    code: 'CROSS_LIBRARY_FETCHED',
    message: 'Cross library fetched successfully',
  },
} as const satisfies Record<string, TApiMessage>;

export const apiCodes = {
  music: MusicApiCodes,
};
