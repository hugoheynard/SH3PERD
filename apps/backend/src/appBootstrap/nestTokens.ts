import { type TCoreUseCases } from './initFactories/createCoreUseCases.js';

export const CORE_REPOSITORIES: symbol = Symbol('CORE_REPOSITORY');


/**USE CASES TOKENS
 * This is a collection of symbols used to identify the core use cases in the application.
 */
export const USE_CASES_TOKENS = {
  auth: 'AUTH_USE_CASES',
  user: 'USER_USE_CASES',
  contracts: 'CONTRACT_USE_CASES',
  musicReferences: 'MUSIC_REFERENCES_USE_CASES',
  musicVersions: 'MUSIC_VERSIONS_USE_CASES',
  musicRepertoireEntries: 'MUSIC_REPERTOIRE_USE_CASES',
  musicLibrary: 'MUSIC_LIBRARY_USE_CASES',
} as const;

export type TCoreUseCasesTypeMap = {
  [K in keyof typeof USE_CASES_TOKENS]: TCoreUseCases[K];
};

// FNS
export const VERIFY_AUTH_TOKEN_FN: symbol = Symbol('VERIFY_AUTH_TOKEN_FN');
export const VERIFY_REFRESH_TOKEN_FN: symbol = Symbol('VERIFY_REFRESH_TOKEN_FN');


// --- TOKENS ---
export const REFRESH_TOKEN_REPO = Symbol('REFRESH_TOKEN_REPO');
export const USER_CREDENTIALS_REPO = Symbol('USER_CREDENTIALS_REPO');
export const USER_PROFILE_REPO = Symbol('USER_PROFILE_REPO');
export const USER_PREFERENCES_REPO = Symbol('USER_PREFERENCES_REPO');
export const CONTRACT_REPO = Symbol('CONTRACT_REPO');
export const EVENT_UNIT_REPO = Symbol('EVENT_UNIT_REPO');
export const MUSIC_REFERENCE_REPO = Symbol('MUSIC_REFERENCE_REPO');
export const MUSIC_VERSION_REPO = Symbol('MUSIC_VERSION_REPO');
export const MUSIC_REPERTOIRE_REPO = Symbol('MUSIC_REPERTOIRE_REPO');