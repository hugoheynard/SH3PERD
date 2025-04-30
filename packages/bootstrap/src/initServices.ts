import type {TAuthConfig, TSecureCookieConfig} from "@sh3pherd/shared-types";
import {createAuthTokenService} from "@sh3pherd/auth";



export const initServices = (input: { repositories: any, authConfig: TAuthConfig, secureCookieConfig: TSecureCookieConfig }): any => {
    const { repositories, authConfig, secureCookieConfig } = input;

    const { refreshTokenRepository } = repositories;

    try {
        const services = {
            authTokenService: createAuthTokenService({
                findRefreshTokenFn: refreshTokenRepository.findRefreshToken,
                saveRefreshTokenFn: refreshTokenRepository.saveRefreshToken,
                deleteRefreshTokenFn: refreshTokenRepository.deleteRefreshToken,
                deleteAllRefreshTokensForUserFn: refreshTokenRepository.deleteAllRefreshTokensForUser,
                authConfig,
                secureCookieConfig
            }),

        };
        console.log('✅ initServices executed');
        return services;

    } catch (e: any) {
        console.error('Error during controller services:', e);
        throw new Error('Failed to initialize services');
    }
}