import { BusinessError } from '../../utils/errorManagement/errorClasses/BusinessError.js';
import type { TUserId, TRefreshToken } from '@sh3pherd/shared-types';
import { Inject, Injectable } from '@nestjs/common';
import type { IRefreshTokenRepository } from '../repositories/RefreshTokenMongoRepository.js';
import { REFRESH_TOKEN_REPO } from '../../appBootstrap/nestTokens.js';

/**
 * Logout Use Case Types
 */
export type TLogoutUseCaseDeps = {
  deleteOneFn: (filter: { refreshToken: TRefreshToken }) => Promise<boolean>;
  deleteManyFn: (filter: { user_id: TUserId }) => Promise<boolean>;
};
export type TLogoutUseCase = (input: { user_id?: TUserId; refreshToken?: TRefreshToken; }) => Promise<boolean>;
/**
 * Factory function for the logout use case.
 *
 * 🎯 Purpose:
 * Securely terminates a user session by revoking one or all of their refresh tokens.
 *
 * 🧠 Logic:
 * - If a `refreshToken` is provided:
 *    - Attempts to revoke it via `deleteRefreshTokenFn`
 *    - If the token is invalid or no longer exists in the DB:
 *      - Falls back to deleting all tokens for the given `user_id` (if provided)
 * - If only `user_id` is provided:
 *    - Deletes all refresh tokens associated with that user
 * - If neither `refreshToken` nor `user_id` are provided:
 *    - Throws a `BusinessError` indicating insufficient input
 *
 * ⚠️ Does NOT handle clearing HTTP cookies — that must be handled at the controller level.
 *
 * @param deps - Functions for deleting a single refresh token or all tokens of a user
 * @returns A logout use case function
 *
 * @throws BusinessError - If no token or user_id is provided, or if token revocation fails with no fallback
 *
 * @example
 * const logout = createLogoutUseCase({ deleteRefreshTokenFn, deleteAllRefreshTokensForUserFn });
 *
 * // Standard case with valid token
 * await logout({ refreshToken: 'refreshToken_abc123' });
 *
 * // Fallback cleanup with user_id
 * await logout({ refreshToken: 'refreshToken_expired', user_id: 'user_123' });
 *
 * // Full revocation without token
 * await logout({ user_id: 'user_456' });
 */

@Injectable()
export class LogoutUseCase {
  constructor(
    @Inject(REFRESH_TOKEN_REPO) private readonly refreshTokenRepo: IRefreshTokenRepository,
  ) {}

  async execute(input: any) {
    const { refreshToken, user_id } = input;

    if (refreshToken) {
      const success = await this.refreshTokenRepo.deleteOne({ refreshToken });

      if (!success) {
        if (user_id) {
          await this.refreshTokenRepo.deleteMany({ user_id });
          return true;
        }

        throw new BusinessError(
          'Invalid refresh token and no user_id provided to fallback cleanup',
          'INVALID_REFRESH_TOKEN',
          401,
        );
      }

      return true;
    }

    if (user_id) {
      await this.refreshTokenRepo.deleteMany({ user_id });
      return true;
    }

    throw new BusinessError('Missing logout input', 'MISSING_LOGOUT_INPUT', 400);
  }
}
