import type { TAuthUseCases } from '../types/auth.core.useCase.js';
import { passwordManager } from '../core/password-manager/passwordManager.composition.js';
import { TechnicalError } from '../../utils/errorManagement/errorClasses/TechnicalError.js';
import type { TUseCasesFactoryGeneric } from '../../types/useCases.generic.types.js';
import { registerUserUseCaseFactory } from './registerUserUseCaseFactory.js';
import { loginUseCaseFactory } from './loginUseCaseFactory.js';
import { refreshSessionUseCaseFactory } from './refreshSessionUseCaseFactory.js';
import { logoutUseCaseFactory } from './logoutUseCaseFactory.js';


export const authUseCasesComposition: TUseCasesFactoryGeneric<TAuthUseCases> = (deps)=> {
  const { authTokenService } = deps.services;
  const { userCredentials: userCredRepo, refreshToken: refreshTokenRepo } = deps.repositories;



  const registerUseCase = registerUserUseCaseFactory({
    findOneFn: (filter)=> userCredRepo.findOne(filter),
    hashPasswordFn: (input)=> passwordManager.hashPassword(input),
    saveFn: (user)=> userCredRepo.save(user),
  });

  const loginUseCase = loginUseCaseFactory({
    findUserByEmailFn: input => userCredRepo.findUserByEmail(input),
    comparePasswordFn: input => passwordManager.comparePassword(input),
    createAuthSessionFn: input => authTokenService.createAuthSession(input),
  });

  const refreshUseCase = refreshSessionUseCaseFactory({
    findOneFn: input => refreshTokenRepo.findOne(input),
    verifyRefreshTokenFn: (input) => authTokenService.verifyRefreshToken(input),
    createAuthSessionFn: (input) => authTokenService.createAuthSession(input),
    deleteOneFn: (input) => refreshTokenRepo.deleteOne(input),
  });

  const logoutUseCase = logoutUseCaseFactory({
    deleteOneFn: filter => refreshTokenRepo.deleteOne(filter),
    deleteManyFn: filter => refreshTokenRepo.deleteMany(filter),
  });

  try {
    return {
      registerUseCase,
      loginUseCase,
      refreshUseCase,
      logoutUseCase
    };
  } catch (err) {
    throw new TechnicalError(
      `Error creating auth use cases: ${err}`,
      'AUTH_USE_CASES_CREATION_FAILED',
      500,
    );
  }
};
