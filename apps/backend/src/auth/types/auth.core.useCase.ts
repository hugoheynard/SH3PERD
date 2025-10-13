import type { TLoginResponseDTO, TUserCredentialsDTO } from '@sh3pherd/shared-types';
import type { TComparePassword, TCreateAuthSessionFn } from './auth.core.contracts.js';
import type { TRefreshTokenSecureCookie } from './auth.domain.tokens.js';
import type { TRegisterUserUseCase } from '../use-cases/registerUserUseCaseFactory.js';
import type { TFindUserCredentialsByEmailFn } from '../../user/repository/UserCredentialsMongoRepository.js';
import type { TRefreshSessionUseCase } from '../use-cases/refreshSessionUseCaseFactory.js';
import type { TLogoutUseCase } from '../use-cases/logoutUseCaseFactory.js';


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
  refreshUseCase: TRefreshSessionUseCase;
  logoutUseCase: TLogoutUseCase;
};
