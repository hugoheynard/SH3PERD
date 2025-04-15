import type {
    TCreateAuthSession,
    TGenerateAuthToken,
    TGenerateRefreshToken,
    TRevokeRefreshToken,
    TVerifyAuthToken,
    TVerifyRefreshToken
} from "../authFunctions.types";


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