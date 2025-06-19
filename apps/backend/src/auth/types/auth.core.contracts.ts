import type {
  TAuthTokenPayload,
  TCreateAuthSessionResult,
  TRefreshToken,
  TRefreshTokenDomainModel,
  TRefreshTokenSecureCookie,
  TRevokeRefreshTokenResult,
} from './auth.domain.tokens.js';
import type { TUserId } from '../../user/types/user.domain.types.js';

//Password

export type TComparePasswordResult = {
  isValid: boolean;
  wasRehashed: boolean;
  newHash?: string;
};

export type THashPasswordFn = (input: { password: string }) => Promise<string>;
export type TComparePassword = (input: {
  password: string;
  hashedPassword: string;
}) => Promise<TComparePasswordResult>;

//AuthTokenManager Functions
export type TGenerateAuthTokenFn = (input: { payload: TAuthTokenPayload }) => Promise<string>;
export type TVerifyAuthTokenFn = (input: {
  authToken: string;
}) => Promise<TAuthTokenPayload | null>;

//RefreshTokenRepository Functions
export type TSaveRefreshTokenFn = (input: {
  refreshTokenDomainModel: TRefreshTokenDomainModel;
}) => Promise<boolean>;
export type TFindRefreshTokenFn = (input: {
  refreshToken: TRefreshToken;
}) => Promise<TRefreshTokenDomainModel | null>;
export type TDeleteRefreshTokenFn = (input: {
  refreshToken: TRefreshToken;
}) => Promise<TRevokeRefreshTokenResult>;
export type TDeleteAllRefreshTokensForUserFn = (input: { user_id: TUserId }) => Promise<boolean>;

//AuthTokenService Functions

export type TCreateAuthSessionFn = (input: {
  user_id: TUserId;
}) => Promise<TCreateAuthSessionResult>;

export type TRefreshAuthSession = (input: {
  refreshTokenDomainModel: TRefreshTokenDomainModel;
}) => Promise<TCreateAuthSessionResult>;

export type TGenerateRefreshTokenCookie = (input: {
  refreshToken: TRefreshToken;
  customPath?: string;
}) => TRefreshTokenSecureCookie;

export type TFindAndVerifyRefreshToken = (input: {
  refreshToken: TRefreshToken;
}) => Promise<{ isValid: boolean; user_id: TUserId | null }>;
