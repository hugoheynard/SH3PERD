import type { TUserId } from '@sh3pherd/shared-types';
import type {
  TCreateUserCredentialRecordFn,
  TFindUserCredentialsByEmailFn,
  TSaveUserCredentialsFn,
} from '../../user/types/user.credentials.contracts.js';
import type {
  TComparePassword,
  TCreateAuthSessionFn,
  TDeleteAllRefreshTokensForUserFn,
  TFindRefreshTokenFn,
  THashPasswordFn,
} from './auth.core.contracts.js';
import type { TRefreshToken, TRefreshTokenSecureCookie } from './auth.domain.tokens.js';
import type { TRevokeRefreshTokenFn, TVerifyRefreshTokenFn } from './auth.core.tokens.contracts.js';

/**
 * Login Use Case Types
 */
export type TUserCredentialsDTO = { email: string; password: string };
export type TLoginResponseDTO = { authToken: string; user_id: TUserId };

export type TLoginUseCaseDeps = {
  findUserByEmailFn: TFindUserCredentialsByEmailFn;
  comparePasswordFn: TComparePassword;
  createAuthSessionFn: TCreateAuthSessionFn;
};
export type TLoginUseCase = (
  input: TUserCredentialsDTO,
) => Promise<TLoginResponseDTO & { refreshTokenSecureCookie: TRefreshTokenSecureCookie }>;

/**
 * Refresh Session Use Case Types
 */
export type TRefreshSessionRequestDTO = { refreshToken: TRefreshToken };
export type TRefreshSessionUseCaseDeps = {
  findRefreshTokenFn: TFindRefreshTokenFn;
  verifyRefreshTokenFn: TVerifyRefreshTokenFn;
  createAuthSessionFn: TCreateAuthSessionFn;
  deleteRefreshTokenFn: TRevokeRefreshTokenFn;
};
export type TRefreshSessionUseCase = (
  input: TRefreshSessionRequestDTO,
) => Promise<TLoginResponseDTO & { refreshTokenSecureCookie: TRefreshTokenSecureCookie }>;

/**
 * Logout Use Case Types
 */
export type TLogoutUseCaseDeps = {
  deleteRefreshTokenFn: TRevokeRefreshTokenFn;
  deleteAllRefreshTokensForUserFn: TDeleteAllRefreshTokensForUserFn;
};
export type TLogoutUseCase = (input: {
  user_id?: TUserId;
  refreshToken?: TRefreshToken;
}) => Promise<boolean>;

/**
 * Register Use Case Types
 */
export type TRegisterResponseDTO = { user_id: TUserId };
export type TRegisterUserUseCaseDeps = {
  findUserByEmailFn: TFindUserCredentialsByEmailFn;
  hashPasswordFn: THashPasswordFn;
  createUserFn: TCreateUserCredentialRecordFn;
  saveUserFn: TSaveUserCredentialsFn;
  generateUserIdFn: () => TUserId;
};
export type TRegisterUserUseCase = (input: TUserCredentialsDTO) => Promise<TRegisterResponseDTO>;

/**
 * Auth Uses Cases
 */
export type TAuthUseCases = {
  login: TLoginUseCase;
  register: TRegisterUserUseCase;
  refresh: TRefreshSessionUseCase;
  logout: TLogoutUseCase;
};
