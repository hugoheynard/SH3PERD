import type { TAuthUseCases } from '../../../auth/types/auth.core.useCase.js';
import {
  createLoginUseCase,
  createLogoutUseCase,
  createRefreshSessionUseCase,
  createRegisterUserUseCase,
} from '../../../auth/use-cases/index.js';
import { generateTypedId } from '../../../utils/ids/generateTypedId.js';
import { passwordManager } from '../../../auth/core/password-manager/index.js';
import { TechnicalError } from '../../../utils/errorManagement/errorClasses/TechnicalError.js';
import { createUserCredentials } from '../../../user/domain/createUserCredentials.js';
import type { TUseCasesFactoryGeneric } from '../../../types/useCases.generic.types.js';

export const createAuthUseCases: TUseCasesFactoryGeneric<TAuthUseCases> = (deps)=> {
  const { authTokenService } = deps.services;
  const { userCredentialsRepository, refreshTokenRepository } = deps.repositories;

  try {
    return {
      register: createRegisterUserUseCase({
        generateUserIdFn: () => generateTypedId('user'),
        createUserFn: createUserCredentials,
        findUserByEmailFn:
          userCredentialsRepository.findUserByEmail.bind(userCredentialsRepository),
        hashPasswordFn: passwordManager.hashPassword.bind(passwordManager),
        saveUserFn: userCredentialsRepository.saveUser.bind(userCredentialsRepository),
      }),
      login: createLoginUseCase({
        findUserByEmailFn:
          userCredentialsRepository.findUserByEmail.bind(userCredentialsRepository),
        comparePasswordFn: passwordManager.comparePassword.bind(passwordManager),
        createAuthSessionFn: authTokenService.createAuthSession.bind(authTokenService),
      }),
      refresh: createRefreshSessionUseCase({
        findRefreshTokenFn: refreshTokenRepository.findRefreshToken.bind(refreshTokenRepository),
        verifyRefreshTokenFn: authTokenService.verifyRefreshToken.bind(authTokenService),
        createAuthSessionFn: authTokenService.createAuthSession.bind(authTokenService),
        deleteRefreshTokenFn:
          refreshTokenRepository.deleteRefreshToken.bind(refreshTokenRepository),
      }),
      logout: createLogoutUseCase({
        deleteRefreshTokenFn:
          refreshTokenRepository.deleteRefreshToken.bind(refreshTokenRepository),
        deleteAllRefreshTokensForUserFn:
          refreshTokenRepository.deleteAllRefreshTokensForUser.bind(refreshTokenRepository),
      }),
    };
  } catch (err) {
    throw new TechnicalError(
      `Error creating auth use cases: ${err}`,
      'AUTH_USE_CASES_CREATION_FAILED',
      500,
    );
  }
};
