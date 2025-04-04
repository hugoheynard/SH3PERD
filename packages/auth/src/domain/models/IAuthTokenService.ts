import type {
    TCreateAuthSessionFunction,
    TRevokeRefreshTokenFunction,
    TVerifyAuthTokenFunction,
    TVerifyRefreshTokenFunction
} from "./function.types";
import type {IAbstractAuthTokenManager} from "./IAbstractAuthTokenManager";
import type {IAbstractRefreshTokenManager} from "./IAbstractRefreshTokenManager";



export interface IAuthTokenService {
    /**
     * Creates a full auth session with access & refresh tokens
     */
    createAuthSession: TCreateAuthSessionFunction;

    /**
     * Verifies access token and returns payload
     */
    verifyAuthToken: TVerifyAuthTokenFunction;

    /**
     * Verifies refresh token and returns boolean validity
     */
    verifyRefreshToken: TVerifyRefreshTokenFunction;

    /**
     * Revokes a refresh token
     */
    revokeRefreshToken: TRevokeRefreshTokenFunction;
}

export type TAuthTokenServiceInput = {
    authTokenManager: IAbstractAuthTokenManager;
    refreshTokenManager: IAbstractRefreshTokenManager;
};