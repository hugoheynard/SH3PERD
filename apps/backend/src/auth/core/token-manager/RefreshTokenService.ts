import { TechnicalError } from '../../../utils/errorManagement/TechnicalError.js';
import type { TRefreshTokenDomainModel } from '@sh3pherd/shared-types';
import type {
  TRevokeRefreshTokenResult,
  TSecureCookieConfig,
} from '../../types/auth.domain.tokens.js';
import type { IRefreshTokenRepository } from '../../repositories/RefreshTokenMongoRepository.js';
import type { TUserId, TRefreshToken, TRefreshTokenRecord } from '@sh3pherd/shared-types';
import { Inject } from '@nestjs/common';
import { generateTypedId } from '../../../utils/ids/generateTypedId.js';
import { dateIsNotPassed } from '../../../utils/date/dateIsNotPassed.js';
import type { TGenerateRefreshTokenCookie } from '../../types/auth.core.contracts.js';
import { REFRESH_COOKIE_NAME, REFRESH_COOKIE_PATH } from '../../auth.constants.js';
import { REFRESH_TOKEN_REPO } from '../../../appBootstrap/nestTokens.js';
import { randomUUID } from 'crypto';

export type TGenerateRefreshTokenFn = (input: {
  user_id: TUserId;
  family_id?: string;
}) => Promise<TRefreshToken>;
export type TVerifyRefreshTokenFn = (input: {
  refreshTokenDomainModel: TRefreshTokenDomainModel;
}) => boolean;
export type TRevokeRefreshTokenFn = (input: {
  refreshToken: TRefreshToken;
}) => Promise<TRevokeRefreshTokenResult>;
export type IAbstractRefreshTokenService = {
  generateRefreshToken: TGenerateRefreshTokenFn;
  verifyRefreshToken: TVerifyRefreshTokenFn;
  revokeRefreshToken: TRevokeRefreshTokenFn;
  generateRefreshTokenCookie: TGenerateRefreshTokenCookie;
};

/**
 * RefreshTokenService handles the lifecycle of refresh tokens,
 * including generation, validation, revocation, and rotation.
 *
 * Supports token families for rotation with reuse detection:
 * - Each login creates a new token family
 * - Each refresh rotates the token within the same family
 * - Reuse of a revoked token invalidates the entire family (theft detection)
 */
export class RefreshTokenService implements IAbstractRefreshTokenService {
  constructor(
    @Inject(REFRESH_TOKEN_REPO) protected readonly refreshTokenRepo: IRefreshTokenRepository,
    private readonly secureCookieConfig: TSecureCookieConfig,
  ) {}

  /**
   * Generates a new refresh token for a given user.
   * If family_id is provided, the token joins that family (rotation).
   * Otherwise, a new family is created (login).
   */
  generateRefreshToken: TGenerateRefreshTokenFn = async (input) => {
    try {
      const newRefreshToken = generateTypedId('refreshToken');

      if (!newRefreshToken) {
        throw new TechnicalError('Failed to generate refresh token', {
          code: 'REFRESH_TOKEN_GENERATION_FAILED',
        });
      }

      const record: TRefreshTokenRecord = {
        id: newRefreshToken,
        refreshToken: newRefreshToken,
        user_id: input.user_id,
        family_id: input.family_id ?? randomUUID(),
        isRevoked: false,
        expiresAt: new Date(Date.now() + this.secureCookieConfig.maxAge),
        createdAt: new Date(),
      };

      await this.refreshTokenRepo.save(record);

      return newRefreshToken;
    } catch (error) {
      throw new TechnicalError('Unable to save refresh token', {
        code: 'REFRESH_TOKEN_SAVE_FAILED',
        cause: error as Error,
        context: { user_id: input.user_id },
      });
    }
  };

  /**
   * Verifies the validity of a refresh token.
   * A token is valid if it is not revoked and not expired.
   */
  verifyRefreshToken: TVerifyRefreshTokenFn = (input) => {
    const { refreshTokenDomainModel } = input;
    if (refreshTokenDomainModel.isRevoked) {
      return false;
    }
    return dateIsNotPassed({ date: refreshTokenDomainModel.expiresAt });
  };

  /**
   * Revokes a given refresh token by marking it as revoked.
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
