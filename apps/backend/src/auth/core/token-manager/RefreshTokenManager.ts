import { TechnicalError } from '../../../utils/errorManagement/errorClasses/TechnicalError.js';
import type { TRefreshTokenDomainModel } from '@sh3pherd/shared-types';
import type { TRevokeRefreshTokenResult } from '../../types/auth.domain.tokens.js';
import type { IRefreshTokenRepository } from '../../repositories/RefreshTokenMongoRepository.js';
import type { TDateIsNotPassed } from '../../types/auth.core.tokens.contracts.js';
import type { TUserId, TRefreshToken, TRefreshTokenRecord } from '@sh3pherd/shared-types';
import type { TGenericSaveFn } from '../../../utils/repoAdaptersHelpers/repository.genericFunctions.types.js';

/**
 * RefreshTokenManager handles the lifecycle of refresh tokens,
 * including generation, validation, and revocation.
 */
//RefreshTokenManager Functions
export type TGenerateRefreshTokenFn = (input: { user_id: TUserId }) => Promise<TRefreshToken>;
export type TVerifyRefreshTokenFn = (input: { refreshTokenDomainModel: TRefreshTokenDomainModel; }) => boolean;
export type TRevokeRefreshTokenFn = (input: { refreshToken: TRefreshToken; }) => Promise<TRevokeRefreshTokenResult>;
export type IAbstractRefreshTokenManager = {
  generateRefreshToken: TGenerateRefreshTokenFn;
  verifyRefreshToken: TVerifyRefreshTokenFn;
  revokeRefreshToken: TRevokeRefreshTokenFn;
};
export type TRefreshTokenManagerDeps = {
  generatorFn: () => Promise<TRefreshToken>;
  validateRefreshTokenDateFn: TDateIsNotPassed;
  saveRefreshTokenFn: TGenericSaveFn<TRefreshTokenRecord>;
  deleteRefreshTokenFn: IRefreshTokenRepository['deleteOne'];
  ttlMs: number;
};

/**
 * RefreshTokenManager handles the lifecycle of refresh tokens,
 * including generation, validation, and revocation.
 */
export class RefreshTokenManager implements IAbstractRefreshTokenManager {
  private readonly deps: TRefreshTokenManagerDeps;

  constructor(deps: TRefreshTokenManagerDeps) {
    this.deps = deps;
  }

  /**
   * Generates a new refresh token for a given user.
   *
   * @param input - The user ID for which to generate the refresh token.
   * @returns A promise that resolves to a new refresh token string.
   * @throws If token generation or saving fails.
   */
  generateRefreshToken: TGenerateRefreshTokenFn = async (input) => {
    try {
      const newRefreshToken = await this.deps.generatorFn();

      if (!newRefreshToken) {
        throw new TechnicalError(
          'Failed to generate refresh token - generator function returned null',
          'REFRESH_TOKEN_GENERATION_FAILED',
          500,
        );
      }

      const record: TRefreshTokenDomainModel = {
        id: newRefreshToken,
        refreshToken: newRefreshToken,
        user_id: input.user_id,
        expiresAt: new Date(Date.now() + this.deps.ttlMs),
        createdAt: new Date(),
      };

      await this.deps.saveRefreshTokenFn(record);

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
    return this.deps.validateRefreshTokenDateFn({ date: refreshTokenDomainModel.expiresAt });
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
      await this.deps.deleteRefreshTokenFn({ refreshToken: input.refreshToken });
      return { revokedToken: input.refreshToken };
    } catch (error) {
      throw new Error(`Unable to revoke refresh token: ${(error as Error).message}`);
    }
  };
}
