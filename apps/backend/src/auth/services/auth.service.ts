import type {
  TCreateAuthSessionFn,
  TGenerateAuthTokenFn,
  TVerifyAuthTokenFn,
} from '../types/auth.core.contracts.js';
import type {
  IAbstractRefreshTokenService,
  TGenerateRefreshTokenFn,
  TRevokeRefreshTokenFn,
  TVerifyRefreshTokenFn,
} from '../core/token-manager/RefreshTokenService.js';
import type { IRefreshTokenRepository } from '../repositories/RefreshTokenMongoRepository.js';
import type { TAuthConfig } from '../types/auth.domain.config.js';
import type { TCreateAuthSessionResult, TSecureCookieConfig } from '../types/auth.domain.tokens.js';
import type {
  TGenericRepoFindOneFn, TGenericSaveFn,
} from '../../utils/repoAdaptersHelpers/repository.genericFunctions.types.js';
import type { TRefreshTokenRecord, TUserId } from '@sh3pherd/shared-types';
import { Inject, Injectable } from '@nestjs/common';
import type { IAbstractJWTService } from '../core/token-manager/JwtService.js';
import { JWT_SERVICE, REFRESH_TOKEN_SERVICE } from '../auth.tokens.js';
import { REFRESH_TOKEN_REPO } from '../../appBootstrap/nestTokens.js';

export type TAuthTokenServiceFactory = (deps: {
  findOneRefreshTokenFn: TGenericRepoFindOneFn<TRefreshTokenRecord>;
  saveFn: TGenericSaveFn<TRefreshTokenRecord>;
  deleteRefreshTokenFn: IRefreshTokenRepository['deleteOne'];
  deleteAllRefreshTokensForUserFn: IRefreshTokenRepository['deleteMany'];
  authConfig: TAuthConfig;
  secureCookieConfig: TSecureCookieConfig;
}) => IAuthTokenService;

export type TAuthTokenServiceDeps = {
  generateAuthTokenFn: TGenerateAuthTokenFn;
  generateRefreshTokenFn: TGenerateRefreshTokenFn;
  findRefreshTokenFn: TGenericRepoFindOneFn<TRefreshTokenRecord>;
  verifyAuthTokenFn: TVerifyAuthTokenFn;
  verifyRefreshTokenFn: TVerifyRefreshTokenFn;
  revokeRefreshTokenFn: TRevokeRefreshTokenFn;
  deleteAllRefreshTokensForUserFn: IRefreshTokenRepository['deleteMany'];
  secureCookieConfig: TSecureCookieConfig;
};
export type TRotateSessionFn = (input: { user_id: TUserId; family_id: string }) => Promise<TCreateAuthSessionResult>;

export type IAuthTokenService = {
  createAuthSession: TCreateAuthSessionFn;
  rotateSession: TRotateSessionFn;
  verifyAuthToken: TVerifyAuthTokenFn;
  verifyRefreshToken: TVerifyRefreshTokenFn;
  revokeRefreshToken: TRevokeRefreshTokenFn;
};

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
@Injectable()
export class AuthService
  implements IAuthTokenService {

  constructor(
    @Inject(REFRESH_TOKEN_SERVICE) private readonly refreshTokenService:IAbstractRefreshTokenService,
    @Inject(JWT_SERVICE) private readonly jwtService: IAbstractJWTService,
    @Inject(REFRESH_TOKEN_REPO) private readonly refreshRepo: IRefreshTokenRepository,
    ){}

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
    await this.refreshRepo.deleteMany({ user_id });

    //generate a new refresh and auth token
    const authToken = await this.jwtService.generateAuthToken({ payload: { user_id } });
    const refreshToken = await this.refreshTokenService.generateRefreshToken({ user_id });
    const refreshTokenSecureCookie = this.refreshTokenService.generateRefreshTokenCookie({ refreshToken });

    return { authToken, refreshToken, refreshTokenSecureCookie };
  };

  /**
   * Rotates the session within an existing token family.
   * Used during refresh — generates new tokens without deleting all user sessions.
   */
  public rotateSession: TRotateSessionFn = async (input) => {
    const { user_id, family_id } = input;

    const authToken = await this.jwtService.generateAuthToken({ payload: { user_id } });
    const refreshToken = await this.refreshTokenService.generateRefreshToken({ user_id, family_id });
    const refreshTokenSecureCookie = this.refreshTokenService.generateRefreshTokenCookie({ refreshToken });

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
    return this.jwtService.verifyAuthToken({ authToken: input.authToken });
  };

  public verifyRefreshToken: TVerifyRefreshTokenFn = (input) => {
    return this.refreshTokenService.verifyRefreshToken(input);
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
    return await this.refreshTokenService.revokeRefreshToken({ refreshToken: input.refreshToken });
  };
}
