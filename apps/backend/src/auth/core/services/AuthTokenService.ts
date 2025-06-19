import type {
  IAuthTokenService,
  TAuthTokenServiceDeps,
  TRevokeRefreshTokenFn,
  TVerifyRefreshTokenFn,
} from '../../types/auth.core.tokens.contracts.js';
import type {
  TCreateAuthSessionFn,
  TGenerateRefreshTokenCookie,
  TVerifyAuthTokenFn,
} from '../../types/auth.core.contracts.js';

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
  }

  /**
   * Creates a full authentication session for a given user.
   *
   * deletes all previous refresh tokens for the user
   *
   * This generates:
   * - a signed access token (JWT or otherwise)
   * - a persistent refresh token stored in the configured token manager
   *
   * @param input - Object containing the user's unique identifier
   * @returns An object containing both access and refresh tokens as well as the secure cookie content
   */
  public createAuthSession: TCreateAuthSessionFn = async (input) => {
    const { user_id } = input;

    //clears the db of all previous refresh tokens for the user
    await this.deps.deleteAllRefreshTokensForUserFn({ user_id });

    //generate a new refresh and auth token
    const authToken = await this.deps.generateAuthTokenFn({ payload: { user_id } });
    const refreshToken = await this.deps.generateRefreshTokenFn({ user_id });
    const refreshTokenSecureCookie = this.generateRefreshTokenCookie({ refreshToken });

    return { authToken, refreshToken, refreshTokenSecureCookie };
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
  public verifyAuthToken: TVerifyAuthTokenFn = async (input) => {
    return this.deps.verifyAuthTokenFn({ authToken: input.authToken });
  };

  public verifyRefreshToken: TVerifyRefreshTokenFn = (input) => {
    return this.deps.verifyRefreshTokenFn(input);
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
  public revokeRefreshToken: TRevokeRefreshTokenFn = async (input) => {
    return await this.deps.revokeRefreshTokenFn({ refreshToken: input.refreshToken });
  };

  public generateRefreshTokenCookie: TGenerateRefreshTokenCookie = (input) => {
    const { secure, sameSite, maxAge } = this.deps.secureCookieConfig;

    return {
      name: 'sh3pherd_refreshToken',
      value: input.refreshToken,
      options: {
        httpOnly: true,
        secure,
        sameSite,
        path: input.customPath ?? '/', // 🧠 fallback
        maxAge,
      },
    };
  };
}
