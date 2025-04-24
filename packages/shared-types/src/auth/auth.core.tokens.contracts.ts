import type {
    TCreateAuthSession,
    TDeleteRefreshToken,
    TFindRefreshToken,
    TGenerateAuthToken, TSaveRefreshToken,
    TVerifyAuthToken,
} from "./auth.core.contracts.js";
import type {IMongoRepoWithDocMapper, TDateIsNotPassed} from "@sh3pherd/shared-utils";
import type {Collection} from "mongodb";
import type {
    TRefreshToken,
    TRefreshTokenDomainModel, TRevokeRefreshTokenResult
} from "./auth.domain.tokens.js";
import type {TUserId} from "../user";
import type {TAuthConfig} from "./auth.domain.config.js";


export interface IRefreshTokenRepository {
    saveRefreshToken: TSaveRefreshToken;
    findRefreshToken: TFindRefreshToken;
    deleteRefreshToken: TDeleteRefreshToken;
}

export interface IRefreshTokenMongoRepositoryDeps extends IMongoRepoWithDocMapper {
    refreshTokenCollection: Collection<TRefreshTokenDomainModel>;
}



/**
 * RefreshTokenManager handles the lifecycle of refresh tokens,
 * including generation, validation, and revocation.
 */
//RefreshTokenManager Functions
export type TGenerateRefreshToken = (input: { user_id: TUserId}) => Promise<TRefreshToken>;
export type TVerifyRefreshToken = (input: { refreshTokenDomainModel: TRefreshTokenDomainModel }) => boolean;
export type TRevokeRefreshToken = (input: { refreshToken: TRefreshToken }) => Promise<TRevokeRefreshTokenResult>;


export interface IAbstractRefreshTokenManager {
    generateRefreshToken: TGenerateRefreshToken;
    verifyRefreshToken: TVerifyRefreshToken;
    revokeRefreshToken: TRevokeRefreshToken;
}

export type TRefreshTokenManagerDeps = {
    generatorFn: () => Promise<TRefreshToken>;
    validateRefreshTokenDateFn: TDateIsNotPassed;
    saveRefreshTokenFn: TSaveRefreshToken;
    deleteRefreshTokenFn: TDeleteRefreshToken;
    ttlMs: number;
};

/**
    * AuthTokenManager handles the lifecycle of auth tokens,
 */

export interface IAbstractAuthTokenManager {
    generateAuthToken: TGenerateAuthToken;
    verifyAuthToken: TVerifyAuthToken;
}

/**
 * AuthTokenService is responsible for managing authentication tokens,
 */
export type TAuthTokenServiceFactory = (deps: {
    saveRefreshTokenFn: TSaveRefreshToken;
    deleteRefreshTokenFn: TDeleteRefreshToken;
    authConfig: TAuthConfig
}) => IAuthTokenService;


export type TAuthTokenServiceDeps = {
    generateAuthTokenFn: TGenerateAuthToken;
    generateRefreshTokenFn: TGenerateRefreshToken;
    verifyAuthTokenFn: TVerifyAuthToken;
    verifyRefreshTokenFn: TVerifyRefreshToken;
    revokeRefreshTokenFn: TRevokeRefreshToken;
}

export interface IAuthTokenService {
    /**
     * Creates a full auth session with access & refresh tokens
     */
    createAuthSession: TCreateAuthSession;

    /**
     * Verifies access token and returns payload
     */
    verifyAuthToken: TVerifyAuthToken;

    /**
     * Verifies refresh token and returns boolean validity
     */
    verifyRefreshToken: TVerifyRefreshToken;

    /**
     * Revokes a refresh token
     */
    revokeRefreshToken: TRevokeRefreshToken;
}