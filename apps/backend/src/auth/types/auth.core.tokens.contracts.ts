import type { TGenerateAuthTokenFn, TVerifyAuthTokenFn } from './auth.core.contracts.js';
import type { TUserId } from '@sh3pherd/shared-types';
import type { TRefreshTokenSecureCookie } from './auth.domain.tokens.js';

export type TDateIsNotPassed = (input: { date: Date }) => boolean;

/**
 * AuthTokenManager handles the lifecycle of auth tokens,
 */
export type IAbstractAuthTokenManager = {
  generateAuthToken: TGenerateAuthTokenFn;
  verifyAuthToken: TVerifyAuthTokenFn;
};

/**
 * AuthTokenService is responsible for managing authentication tokens,
 */
export type TAuthSessionResult = {
  authToken: string;
  user_id: TUserId;
  refreshTokenSecureCookie: TRefreshTokenSecureCookie;
};

