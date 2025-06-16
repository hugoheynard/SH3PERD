import type {TAuthUseCases} from "../../../auth/types/auth.core.useCase.js";
import {
    createLoginUseCase,
    createLogoutUseCase,
    createRefreshSessionUseCase,
    createRegisterUserUseCase
} from "../../../auth/use-cases/index.js";
import {generateTypedId} from "../../../utils/ids/generateTypedId.js";
import {passwordManager} from "../../../auth/core/password-manager/index.js";
import {TechnicalError} from "../../../utils/errorManagement/errorClasses/TechnicalError.js";
import {createUser} from "../../../user/domain/createUser.js";
import type { TCoreRepositories } from '../createCoreRepositories.js';


export const createAuthUseCases = (deps: { services: any; repositories: TCoreRepositories }): TAuthUseCases => {
    const { authTokenService } = deps.services;
    const { userCredentialsRepository, refreshTokenRepository } = deps.repositories;

    try {
        return {
            register: createRegisterUserUseCase({
                generateUserIdFn: () => generateTypedId('user'),
                createUserFn: createUser,
                findUserByEmailFn: userCredentialsRepository.findUserByEmail,
                hashPasswordFn: passwordManager.hashPassword,
                saveUserFn: userCredentialsRepository.saveUser,
            }),
            login: createLoginUseCase({
                findUserByEmailFn: userCredentialsRepository.findUserByEmail,
                comparePasswordFn: passwordManager.comparePassword,
                createAuthSessionFn: authTokenService.createAuthSession,
            }),
            logout: createLogoutUseCase({
                revokeRefreshTokenFn: authTokenService.revokeRefreshToken,
            }),
            refresh: createRefreshSessionUseCase({
                findRefreshTokenFn: refreshTokenRepository.findRefreshToken,
                verifyRefreshTokenFn: authTokenService.verifyRefreshToken,
                createAuthSessionFn: authTokenService.createAuthSession,
                revokeRefreshTokenFn: authTokenService.revokeRefreshToken,
            })
        };
    } catch (err) {
        throw new TechnicalError(
            `Error creating auth use cases: ${err}`,
            'AUTH_USE_CASES_CREATION_FAILED',
            500
        );
    }
}