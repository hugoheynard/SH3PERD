import type {
    IAbstractAuthTokenManager
} from "../../domain/models/IAbstractAuthTokenManager";
import type {
    IAbstractRefreshTokenManager,


} from "../../domain/models/IAbstractRefreshTokenManager";
import type {
    IAuthTokenService,
    TAuthTokenServiceInput
} from "../../domain/models/IAuthTokenService";
import type {
    TCreateAuthSessionFunction,
    TRevokeRefreshTokenFunction,
    TVerifyAuthTokenFunction,
    TVerifyRefreshTokenFunction
} from "../../domain/models/function.types";

/**
 * AuthTokenService orchestrates the creation and validation of both access and refresh tokens.
 *
 * This service acts as the main authentication handler, coordinating low-level token managers (JWT, refresh tokens)
 * to provide a complete and secure session management interface.
 *
 * Responsibilities include:
 * - Generating an authentication session (access + refresh token pair)
 * - Verifying access and refresh tokens
 * - Revoking refresh tokens
 */
export class AuthTokenService implements IAuthTokenService {
    private readonly authTokenManager: IAbstractAuthTokenManager;
    private readonly refreshTokenManager: IAbstractRefreshTokenManager;

    constructor(input: TAuthTokenServiceInput) {
        this.authTokenManager = input.authTokenManager;
        this.refreshTokenManager = input.refreshTokenManager;
    };

    /**
     * Creates a full authentication session for a given user.
     *
     * This generates:
     * - a signed access token (JWT or otherwise)
     * - a persistent refresh token stored in the configured token manager
     *
     * @param input - Object containing the user's unique identifier
     * @returns An object containing both access and refresh tokens
     */
    public createAuthSession: TCreateAuthSessionFunction = async (input) => {
        const authToken = await this.authTokenManager.generateAuthToken({ payload: { user_id: input.user_id } });
        const refreshToken = await this.refreshTokenManager.generateRefreshToken({ user_id: input.user_id });
        return {authToken, refreshToken};
    };

    /**
     * Verifies and decodes the provided access token.
     *
     * This method delegates the validation to the injected access token manager
     * and returns the token payload if valid.
     *
     * @param input - Object containing the raw access token
     * @returns The decoded token payload if verification is successful
     * @throws If the token is invalid or expired
     */
    verifyAuthToken: TVerifyAuthTokenFunction = async (input) => {
        return this.authTokenManager.verifyAuthToken({ token: input.token });
    };

    /**
     * Verifies the validity of a refresh token.
     *
     * Delegates the logic to the refresh token manager, which may implement
     * expiration, revocation, or blacklist logic.
     *
     * @param input - Object containing the refresh token
     * @returns A boolean indicating whether the token is valid
     */
    verifyRefreshToken: TVerifyRefreshTokenFunction = (input) => {
        return this.refreshTokenManager.verifyRefreshToken({ refreshTokenRecord: input.refreshTokenRecord });
    };

    /**
     * Revokes the given refresh token.
     *
     * Typically used during logout or token rotation flows.
     * Ensures the token cannot be reused to obtain new access tokens.
     *
     * @param input - Object containing the refresh token to revoke
     * @returns An object with the revoked token identifier
     * @throws If the revocation fails or token is not found
     */
    revokeRefreshToken: TRevokeRefreshTokenFunction = async (input) => {
        return await this.refreshTokenManager.revokeRefreshToken({ refreshToken: input.refreshToken });
    };
}