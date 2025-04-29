import type {TAuthTokenServiceFactory} from "@sh3pherd/shared-types";
import {JwtAuthTokenManager, RefreshTokenManager} from "@sh3pherd/token-manager";
import {dateIsNotPassed, generateTypedId} from "@sh3pherd/shared-utils";
import {AuthTokenService} from "../core/index.js";


export const createAuthTokenService: TAuthTokenServiceFactory = (deps) => {
    const { saveRefreshTokenFn, deleteRefreshTokenFn, deleteAllRefreshTokensForUserFn,  authConfig, secureCookieConfig } = deps;

    try {
        const authTokenManager = new JwtAuthTokenManager({
            options: {
                privateKey: authConfig.privateKey,
                publicKey: authConfig.publicKey,
                accessTokenExpiresIn: authConfig.authToken_TTL_SECONDS,
            },
        });

        const refreshTokenManager = new RefreshTokenManager({
            generatorFn: ()=> Promise.resolve(generateTypedId('refreshToken')),
            validateRefreshTokenDateFn: dateIsNotPassed,
            saveRefreshTokenFn: (input) => saveRefreshTokenFn(input),
            deleteRefreshTokenFn: (input) => deleteRefreshTokenFn(input),
            ttlMs: secureCookieConfig.maxAge
        });

        return new AuthTokenService({
            generateAuthTokenFn: authTokenManager.generateAuthToken,
            generateRefreshTokenFn: refreshTokenManager.generateRefreshToken,
            verifyAuthTokenFn: authTokenManager.verifyAuthToken,
            verifyRefreshTokenFn: refreshTokenManager.verifyRefreshToken,
            revokeRefreshTokenFn: refreshTokenManager.revokeRefreshToken,
            deleteAllRefreshTokensForUserFn,
            secureCookieConfig,
        });
    } catch (error) {
        console.error("Error initializing AuthTokenService:", error);
        throw error;
    }
}