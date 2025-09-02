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
        findUserByEmailFn: (input)=> userCredentialsRepository.findUserByEmail(input),
        hashPasswordFn: (input)=> passwordManager.hashPassword(input),
        saveUserFn: (input)=> userCredentialsRepository.saveUser(input),
      }),
      login: createLoginUseCase({
        findUserByEmailFn: (input)=> userCredentialsRepository.findUserByEmail(input),
        comparePasswordFn: (input) => passwordManager.comparePassword(input),
        createAuthSessionFn: (input) => authTokenService.createAuthSession(input),
      }),
      refresh: createRefreshSessionUseCase({
        findRefreshTokenFn: (input) => refreshTokenRepository.findRefreshToken(input),
        verifyRefreshTokenFn: (input) => authTokenService.verifyRefreshToken(input),
        createAuthSessionFn: (input) => authTokenService.createAuthSession(input),
        deleteRefreshTokenFn: (input) => refreshTokenRepository.deleteRefreshToken(input),
      }),
      logout: createLogoutUseCase({
        deleteRefreshTokenFn: (input) => refreshTokenRepository.deleteRefreshToken(input),
        deleteAllRefreshTokensForUserFn: (input) => refreshTokenRepository.deleteAllRefreshTokensForUser(input),
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
