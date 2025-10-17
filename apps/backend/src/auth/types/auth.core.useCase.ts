import type { TLoginResponseDTO, TUserCredentialsDTO } from '@sh3pherd/shared-types';
import type { TComparePassword, TCreateAuthSessionFn } from './auth.core.contracts.js';
import type { TRefreshTokenSecureCookie } from './auth.domain.tokens.js';
import type { TFindUserCredentialsByEmailFn } from '../../user/repository/UserCredentialsMongoRepository.js';
import type { TRefreshSessionUseCase } from '../use-cases/RefreshSessionUseCase.js';
import type { TLogoutUseCase } from '../use-cases/LogoutUseCase.js';
import type { TRegisterUserUseCase } from '../use-cases/RegisterUserUseCase.js';


export type TLoginUseCaseDeps = {
  findUserByEmailFn: TFindUserCredentialsByEmailFn;
  comparePasswordFn: TComparePassword;
  createAuthSessionFn: TCreateAuthSessionFn;
};
export type TLoginUseCase = (input: TUserCredentialsDTO) => Promise<TLoginResponseDTO & { refreshTokenSecureCookie: TRefreshTokenSecureCookie }>;



/**
 * Auth Uses Cases
 */
export type TAuthUseCases = {
  loginUseCase: TLoginUseCase;
  registerUseCase: TRegisterUserUseCase;
  refreshSessionUseCase: TRefreshSessionUseCase;
  logoutUseCase: TLogoutUseCase;
};
