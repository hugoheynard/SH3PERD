import {generateTypedId, TechnicalError} from "@sh3pherd/shared-utils";
import {createUserDomainModel} from "@sh3pherd/user";
import {passwordManager} from "@sh3pherd/password-manager";
import {
    createLoginUseCase,
    createLogoutUseCase,
    createRefreshSessionUseCase,
    createRegisterUserUseCase
} from "@sh3pherd/auth";
import type {TAuthUseCases} from "@sh3pherd/shared-types";


export const createAuthUseCases = (deps: { services: any; repositories: any }): TAuthUseCases => {
    const { authTokenService } = deps.services;
    const { userRepository, refreshTokenRepository } = deps.repositories;

    try {
        return {
            register: createRegisterUserUseCase({
                generateUserIdFn: () => generateTypedId('user'),
                createUserFn: createUserDomainModel,
                findUserByEmailFn: userRepository.findUserByEmail,
                hashPasswordFn: passwordManager.hashPassword,
                saveUserFn: userRepository.saveUser,
            }),
            login: createLoginUseCase({
                findUserByEmailFn: userRepository.findUserByEmail,
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