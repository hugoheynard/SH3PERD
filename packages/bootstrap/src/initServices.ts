import type {TAuthConfig} from "@sh3pherd/shared-types";
import {createAuthTokenService} from "@sh3pherd/auth";



export const initServices = (input: { repositories: any, authConfig: TAuthConfig }): any => {
    const { repositories, authConfig } = input;

    const { refreshTokenRepository } = repositories;

    try {
        const services = {
            authTokenService: createAuthTokenService({
                saveRefreshTokenFn: refreshTokenRepository.saveRefreshToken,
                deleteRefreshTokenFn: refreshTokenRepository.deleteRefreshToken,
                authConfig: authConfig
            }),

        };
        console.log('✅ initServices executed');
        return services;

    } catch (e: any) {
        console.error('Error during controller services:', e);
        throw new Error('Failed to initialize services');
    }
}