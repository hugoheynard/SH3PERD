import type {
  TCreateAuthSessionFn,
  TDeleteAllRefreshTokensForUserFn,
  TDeleteRefreshTokenFn,
  TFindRefreshTokenFn,
  TGenerateAuthTokenFn,
  TGenerateRefreshTokenCookie,
  TSaveRefreshTokenFn,
  TVerifyAuthTokenFn,
} from './auth.core.contracts.js';
import type { TBaseMongoRepoDeps } from '../../types/mongo/mongo.types.js';
import type { TUserId } from '../../user/types/user.domain.types.js';
import type {
  TRefreshToken,
  TRefreshTokenDomainModel,
  TRefreshTokenSecureCookie,
  TRevokeRefreshTokenResult,
  TSecureCookieConfig,
} from './auth.domain.tokens.js';
import type { TAuthConfig } from './auth.domain.config.js';

export type TDateIsNotPassed = (input: { date: Date }) => boolean;

export type IRefreshTokenRepository = {
  findRefreshToken: TFindRefreshTokenFn;
  saveRefreshToken: TSaveRefreshTokenFn;
  deleteRefreshToken: TDeleteRefreshTokenFn;
  deleteAllRefreshTokensForUser: TDeleteAllRefreshTokensForUserFn;
};

export type TRefreshTokenMongoRepositoryDeps = TBaseMongoRepoDeps;

/**
 * RefreshTokenManager handles the lifecycle of refresh tokens,
 * including generation, validation, and revocation.
 */
//RefreshTokenManager Functions
export type TGenerateRefreshTokenFn = (input: { user_id: TUserId }) => Promise<TRefreshToken>;
export type TVerifyRefreshTokenFn = (input: {
  refreshTokenDomainModel: TRefreshTokenDomainModel;
}) => boolean;
export type TRevokeRefreshTokenFn = (input: {
  refreshToken: TRefreshToken;
}) => Promise<TRevokeRefreshTokenResult>;

export type IAbstractRefreshTokenManager = {
  generateRefreshToken: TGenerateRefreshTokenFn;
  verifyRefreshToken: TVerifyRefreshTokenFn;
  revokeRefreshToken: TRevokeRefreshTokenFn;
};

export type TRefreshTokenManagerDeps = {
  generatorFn: () => Promise<TRefreshToken>;
  validateRefreshTokenDateFn: TDateIsNotPassed;
  saveRefreshTokenFn: TSaveRefreshTokenFn;
  deleteRefreshTokenFn: TDeleteRefreshTokenFn;
  ttlMs: number;
};

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

export type TAuthTokenServiceFactory = (deps: {
  findRefreshTokenFn: TFindRefreshTokenFn;
  saveRefreshTokenFn: TSaveRefreshTokenFn;
  deleteRefreshTokenFn: TDeleteRefreshTokenFn;
  deleteAllRefreshTokensForUserFn: TDeleteAllRefreshTokensForUserFn;
  authConfig: TAuthConfig;
  secureCookieConfig: TSecureCookieConfig;
}) => IAuthTokenService;

export type TAuthTokenServiceDeps = {
  generateAuthTokenFn: TGenerateAuthTokenFn;
  generateRefreshTokenFn: TGenerateRefreshTokenFn;
  findRefreshTokenFn: TFindRefreshTokenFn;
  verifyAuthTokenFn: TVerifyAuthTokenFn;
  verifyRefreshTokenFn: TVerifyRefreshTokenFn;
  revokeRefreshTokenFn: TRevokeRefreshTokenFn;
  deleteAllRefreshTokensForUserFn: TDeleteAllRefreshTokensForUserFn;
  secureCookieConfig: TSecureCookieConfig;
};

export type IAuthTokenService = {
  createAuthSession: TCreateAuthSessionFn;
  verifyAuthToken: TVerifyAuthTokenFn;
  verifyRefreshToken: TVerifyRefreshTokenFn;
  revokeRefreshToken: TRevokeRefreshTokenFn;
  generateRefreshTokenCookie: TGenerateRefreshTokenCookie;
};
