import type { TAuthTokenPayload, TCreateAuthSessionResult, TRefreshTokenSecureCookie } from './auth.domain.tokens.js';
import type { TRefreshToken, TRefreshTokenDomainModel, TUserId } from '@sh3pherd/shared-types';

//Password

export type TComparePasswordResult = {
  isValid: boolean;
  wasRehashed: boolean;
  newHash?: string;
};

export type THashPasswordFn = (input: { password: string }) => Promise<string>;
export type TComparePassword = (input: { password: string; hashedPassword: string; }) => Promise<TComparePasswordResult>;

//AuthTokenManager Functions
export type TGenerateAuthTokenFn = (input: { payload: TAuthTokenPayload }) => Promise<string>;
export type TVerifyAuthTokenFn = (input: { authToken: string; }) => Promise<TAuthTokenPayload | null>;

//AuthTokenService Functions

export type TCreateAuthSessionFn = (input: { user_id: TUserId; }) => Promise<TCreateAuthSessionResult>;

export type TRefreshAuthSession = (input: { refreshTokenDomainModel: TRefreshTokenDomainModel; }) => Promise<TCreateAuthSessionResult>;

export type TGenerateRefreshTokenCookie = (input: { refreshToken: TRefreshToken; customPath?: string; }) => TRefreshTokenSecureCookie;

export type TFindAndVerifyRefreshToken = (input: { refreshToken: TRefreshToken; }) => Promise<{ isValid: boolean; user_id: TUserId | null }>;
