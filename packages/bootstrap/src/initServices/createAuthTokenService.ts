import {AuthTokenService, IAuthTokenService} from "@sh3pherd/auth";
import {JwtAuthTokenManager, RefreshTokenManager} from "@sh3pherd/token-manager";
import {dateIsPassed, generateTypedId} from "@sh3pherd/shared-utils";


export const createAuthTokenService = (deps: { refreshTokenRepository, authConfig }): IAuthTokenService => {
    const { refreshTokenRepository, authConfig } = deps;

    try {
        const authTokenManager = new JwtAuthTokenManager({
            options: {
                privateKey: authConfig.privateKey,
                publicKey: authConfig.publicKey,
                accessTokenExpiresIn: authConfig.authToken_TTL,
                refreshTokenExpiresIn: authConfig.refreshTokenTTL,
            },
        });

        const refreshTokenManager = new RefreshTokenManager({
            generatorFunction: ()=> Promise.resolve(generateTypedId('refreshToken')),
            validateRefreshTokenDateFn: dateIsPassed,
            saveTokenFn: (input)=>refreshTokenRepository.saveRefreshToken(input),
            deleteTokenFn: (input)=>refreshTokenRepository.deleteRefreshToken(input),
            ttlMs: authConfig.refreshTokenTTL
        });

        return new AuthTokenService({
            generateAuthTokenFn: authTokenManager.generateAuthToken,
            generateRefreshTokenFn: refreshTokenManager.generateRefreshToken,
            verifyAuthTokenFn: authTokenManager.verifyAuthToken,
            verifyRefreshTokenFn: refreshTokenManager.verifyRefreshToken,
            revokeRefreshTokenFn: refreshTokenManager.revokeRefreshToken
        });
    } catch (error) {
        console.error("Error initializing AuthTokenService:", error);
        throw error;
    }

}