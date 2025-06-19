import { type TCoreUseCases } from './initFactories/createCoreUseCases.js';

export const MONGO_CLIENT: symbol = Symbol('MONGO_CLIENT');

export const CORE_REPOSITORIES: symbol = Symbol('CORE_REPOSITORY');

export const CORE_SERVICES: symbol = Symbol('CORE_SERVICES');

//USE CASES TOKENS
export const CORE_USECASES: symbol = Symbol('CORE_USECASES');

export const USE_CASES_TOKENS = {
  auth: Symbol('AUTH_USE_CASES'),
  musicRepertoire: Symbol('MUSIC_REPERTOIRE_USE_CASES'),
} as const;

export type TCoreUseCasesTypeMap = {
  [K in keyof typeof USE_CASES_TOKENS]: TCoreUseCases[K];
};

// FNS
export const VERIFY_AUTH_TOKEN_FN: symbol = Symbol('VERIFY_AUTH_TOKEN_FN');
export const VERIFY_REFRESH_TOKEN_FN: symbol = Symbol('VERIFY_REFRESH_TOKEN_FN');
