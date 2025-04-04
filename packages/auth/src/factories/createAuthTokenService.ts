import {AuthTokenService, type IAuthTokenService, RefreshTokenMongoRepository} from "@sh3pherd/auth";
import {JwtAuthTokenManager, RefreshTokenManager, checkExpirationDate} from "@sh3pherd/token-manager";
import {generateTypedId, mapMongoDocToDomainModel} from "@sh3pherd/shared-utils";

export type TAuthConfig = {
    privateKey: string;
    publicKey: string;
    authToken_TTL: number;
    refreshTokenTTL: number;
    tokenTTL: number;
}

export const createAuthTokenService = (input: { db: any, authConfig: TAuthConfig }): IAuthTokenService => {
    const { db, authConfig } = input;

    if (!db) {
        throw new Error('Database connection is not initialized');
    }

    const refreshTokenRepository = new RefreshTokenMongoRepository({
        refreshTokenCollection: db.collection('refresh_tokens'),
        mapMongoDocToDomainModelFunction: mapMongoDocToDomainModel
    });

    const authTokenManager = new JwtAuthTokenManager({
        options: {
            privateKey: authConfig.privateKey, //TODO: ENV
            publicKey: authConfig.publicKey, //TODO: ENV
            accessTokenExpiresIn: authConfig.authToken_TTL, //TODO: ENV 900000 pas géré encore
            refreshTokenExpiresIn: authConfig.refreshTokenTTL, //TODO: pas sa place dans les options
        },
    });

    const refreshTokenManager = new RefreshTokenManager({
        generatorFunction: ()=> Promise.resolve(generateTypedId('refreshToken')),
        validateRefreshTokenDateFunction: checkExpirationDate,
        refreshTokenRepository: refreshTokenRepository,
        ttlMs: authConfig.refreshTokenTTL //TODO: ENV 604800000
    });


    return new AuthTokenService({
        authTokenManager: authTokenManager,
        refreshTokenManager: refreshTokenManager,
    });
}