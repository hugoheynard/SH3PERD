import type {
    TCreateAuthSession,
    TDeleteAllRefreshTokensForUser,
    TDeleteRefreshToken,
    TFindAndVerifyRefreshToken,
    TFindRefreshToken,
    TGenerateAuthToken,
    TGenerateRefreshTokenCookie,
    TRefreshAuthSession,
    TSaveRefreshToken,
    TVerifyAuthToken,
} from "./auth.core.contracts.js";
import type {TDateIsNotPassed} from "@sh3pherd/shared-utils";
import type {Collection} from "mongodb";
import type {
    TRefreshToken,
    TRefreshTokenDomainModel,
    TRefreshTokenSecureCookie,
    TRevokeRefreshTokenResult,
    TSecureCookieConfig
} from "./auth.domain.tokens.js";
import type {TAuthConfig} from "./auth.domain.config.js";
import type {TUserId} from "../user/index.js";


export interface IRefreshTokenRepository {
    findRefreshToken: TFindRefreshToken;
    saveRefreshToken: TSaveRefreshToken;
    deleteRefreshToken: TDeleteRefreshToken;
    deleteAllRefreshTokensForUser: TDeleteAllRefreshTokensForUser;
}

export interface IRefreshTokenMongoRepositoryDeps {
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
export type TAuthSessionResult = {
    authToken: string;
    user_id: TUserId;
    refreshTokenSecureCookie: TRefreshTokenSecureCookie;
}

export type TAuthTokenServiceFactory = (deps: {
    findRefreshTokenFn: TFindRefreshToken;
    saveRefreshTokenFn: TSaveRefreshToken;
    deleteRefreshTokenFn: TDeleteRefreshToken;
    deleteAllRefreshTokensForUserFn: TDeleteAllRefreshTokensForUser;
    authConfig: TAuthConfig,
    secureCookieConfig: TSecureCookieConfig;
}) => IAuthTokenService;


export type TAuthTokenServiceDeps = {
    generateAuthTokenFn: TGenerateAuthToken;
    generateRefreshTokenFn: TGenerateRefreshToken;
    findRefreshTokenFn: TFindRefreshToken;
    verifyAuthTokenFn: TVerifyAuthToken;
    verifyRefreshTokenFn: TVerifyRefreshToken;
    revokeRefreshTokenFn: TRevokeRefreshToken;
    deleteAllRefreshTokensForUserFn: TDeleteAllRefreshTokensForUser;
    secureCookieConfig: TSecureCookieConfig;
}

export interface IAuthTokenService {
    createAuthSession: TCreateAuthSession;
    verifyAuthToken: TVerifyAuthToken;
    revokeRefreshToken: TRevokeRefreshToken;
    generateRefreshTokenCookie: TGenerateRefreshTokenCookie;
}