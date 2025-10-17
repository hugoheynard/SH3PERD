import { TechnicalError } from '../../../utils/errorManagement/errorClasses/TechnicalError.js';
import type { TRefreshTokenDomainModel } from '@sh3pherd/shared-types';
import type { TRevokeRefreshTokenResult, TSecureCookieConfig } from '../../types/auth.domain.tokens.js';
import type { IRefreshTokenRepository } from '../../repositories/RefreshTokenMongoRepository.js';
import type { TUserId, TRefreshToken, TRefreshTokenRecord } from '@sh3pherd/shared-types';
import { Inject } from '@nestjs/common';
import { generateTypedId } from '../../../utils/ids/generateTypedId.js';
import { dateIsNotPassed } from '../../../utils/date/dateIsNotPassed.js';
import type { TGenerateRefreshTokenCookie } from '../../types/auth.core.contracts.js';
import { REFRESH_COOKIE_NAME, REFRESH_COOKIE_PATH } from '../../auth.constants.js';
import { REFRESH_TOKEN_REPO } from '../../../appBootstrap/nestTokens.js';

/**
 * RefreshTokenManager handles the lifecycle of refresh tokens,
 * including generation, validation, and revocation.
 */
//RefreshTokenManager Functions
export type TGenerateRefreshTokenFn = (input: { user_id: TUserId }) => Promise<TRefreshToken>;
export type TVerifyRefreshTokenFn = (input: { refreshTokenDomainModel: TRefreshTokenDomainModel; }) => boolean;
export type TRevokeRefreshTokenFn = (input: { refreshToken: TRefreshToken; }) => Promise<TRevokeRefreshTokenResult>;
export type IAbstractRefreshTokenService = {
  generateRefreshToken: TGenerateRefreshTokenFn;
  verifyRefreshToken: TVerifyRefreshTokenFn;
  revokeRefreshToken: TRevokeRefreshTokenFn;
  generateRefreshTokenCookie: TGenerateRefreshTokenCookie;
};

/**
 * RefreshTokenManager handles the lifecycle of refresh tokens,
 * including generation, validation, and revocation.
 */
export class RefreshTokenService
  implements IAbstractRefreshTokenService {

  constructor(
    @Inject(REFRESH_TOKEN_REPO) protected readonly refreshTokenRepo: IRefreshTokenRepository,
    private readonly secureCookieConfig:  TSecureCookieConfig) {};

  /**
   * Generates a new refresh token for a given user.
   *
   * @param input - The user ID for which to generate the refresh token.
   * @returns A promise that resolves to a new refresh token string.
   * @throws If token generation or saving fails.
   */
  generateRefreshToken: TGenerateRefreshTokenFn = async (input) => {
    try {
      const newRefreshToken = generateTypedId('refreshToken');

      if (!newRefreshToken) {
        throw new TechnicalError(
          'Failed to generate refresh token - generator function returned null',
          'REFRESH_TOKEN_GENERATION_FAILED',
          500,
        );
      }

      const record: TRefreshTokenRecord = {
        id: newRefreshToken,
        refreshToken: newRefreshToken,
        user_id: input.user_id,
        expiresAt: new Date(Date.now() + this.secureCookieConfig.maxAge),
        createdAt: new Date(),
      };

      await this.refreshTokenRepo.save(record);

      return newRefreshToken;
    } catch (error) {
      throw new TechnicalError(
        `Unable to save refresh token for user ${input.user_id}: ${(error as Error).message}`,
        'REFRESH_TOKEN_SAVE_FAILED',
        500,
      );
    }
  };

  /**
   * Verifies the validity of a refresh token.
   *
   * @param input - The refresh token to validate.
   * @returns A promise that resolves to a boolean indicating whether the token is valid.
   */
  verifyRefreshToken: TVerifyRefreshTokenFn = (input) => {
    const { refreshTokenDomainModel } = input;
    return dateIsNotPassed({ date: refreshTokenDomainModel.expiresAt });
  };

  /**
   * Revokes a given refresh token.
   *
   * @param input - The refresh token to revoke.
   * @returns A promise that resolves to an object containing the revoked token.
   * @throws If the revocation fails or the token does not exist.
   */
  revokeRefreshToken: TRevokeRefreshTokenFn = async (input) => {
    try {
      await this.refreshTokenRepo.deleteOne({ refreshToken: input.refreshToken });
      return { revokedToken: input.refreshToken };
    } catch (error) {
      throw new Error(`Unable to revoke refresh token: ${(error as Error).message}`);
    }
  };

  public generateRefreshTokenCookie: TGenerateRefreshTokenCookie = (input) => {
    const { secure, sameSite, maxAge } = this.secureCookieConfig;

    return {
      name: REFRESH_COOKIE_NAME,
      value: input.refreshToken,
      options: {
        httpOnly: true,
        secure,
        sameSite,
        path: REFRESH_COOKIE_PATH,
        maxAge,
      },
    };
  };
}
