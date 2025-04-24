import type {
    IAuthTokenService,
    TAuthTokenServiceDeps,
    TCreateAuthSession, TRefreshTokenDomainModel,
    TRevokeRefreshToken,
    TVerifyAuthToken,
    TVerifyRefreshToken
} from "@sh3pherd/shared-types";


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

    constructor(private readonly deps: TAuthTokenServiceDeps) {
        this.deps = deps;
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
    public createAuthSession: TCreateAuthSession = async (input) => {
        const authToken = await this.deps.generateAuthTokenFn({ payload: { user_id: input.user_id } });
        const refreshToken = await this.deps.generateRefreshTokenFn({ user_id: input.user_id });
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
    public verifyAuthToken: TVerifyAuthToken = async (input) => {
        return this.deps.verifyAuthTokenFn({ token: input.token });
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
    public verifyRefreshToken: TVerifyRefreshToken = (input) => {
        return this.deps.verifyRefreshTokenFn({ refreshTokenDomainModel: input.refreshTokenDomainModel });
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
    public revokeRefreshToken: TRevokeRefreshToken = async (input) => {
        return await this.deps.revokeRefreshTokenFn({ refreshToken: input.refreshToken });
    };

    /**
     * Generates a new access token using a valid refresh token.
     *
     * This method assumes the refresh token has already been resolved to its record.
     * It validates the refresh token and re-issues a new access token.
     *
     * @param input - Object containing the refresh token record
     * @returns A new signed access token
     * @throws If the refresh token is invalid or expired
     */
    public refreshSession = async (input: { refreshTokenDomainModel: TRefreshTokenDomainModel }): Promise<string> => {
        const isValid = this.deps.verifyRefreshTokenFn({ refreshTokenDomainModel: input.refreshTokenDomainModel });

        if (!isValid) {
            throw new Error("Invalid or expired refresh token");
        }

        return this.deps.generateAuthTokenFn({
            payload: { user_id: input.refreshTokenDomainModel.user_id }
        });
    };
}