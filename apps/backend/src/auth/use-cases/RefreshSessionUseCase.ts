import { BusinessError } from '../../utils/errorManagement/errorClasses/BusinessError.js';
import type { TCreateAuthSessionFn } from '../types/auth.core.contracts.js';
import type { TRefreshTokenSecureCookie } from '../types/auth.domain.tokens.js';
import type { TLoginResponseDTO, TRefreshSessionRequestDTO, TRefreshToken, TRefreshTokenRecord } from '@sh3pherd/shared-types';
import type { TGenericRepoFindOneFn } from '../../utils/repoAdaptersHelpers/repository.genericFunctions.types.js';
import type { IAbstractRefreshTokenService, TVerifyRefreshTokenFn } from '../core/token-manager/RefreshTokenService.js';
import type { IRefreshTokenRepository } from '../repositories/RefreshTokenMongoRepository.js';
import { Inject, Injectable } from '@nestjs/common';
import type { IAuthTokenService } from '../services/auth.service.js';
import { AUTH_SERVICE, REFRESH_TOKEN_SERVICE } from '../auth.tokens.js';
import { REFRESH_TOKEN_REPO } from '../../appBootstrap/nestTokens.js';

/**
 * Refresh Session Use Case Types
 */

export type TRefreshSessionUseCaseDeps = {
  findOneFn: TGenericRepoFindOneFn<TRefreshTokenRecord>;
  verifyRefreshTokenFn: TVerifyRefreshTokenFn;
  createAuthSessionFn: TCreateAuthSessionFn;
  deleteOneFn: (filter: { refreshToken: TRefreshToken }) => Promise<boolean>;
};
export type TRefreshSessionUseCase = (input: TRefreshSessionRequestDTO) => Promise<TLoginResponseDTO & { refreshTokenSecureCookie: TRefreshTokenSecureCookie }>;

/**
 * RefreshSessionUseCase - Re-issues a new authentication session using a valid refresh token.
 *
 * This use case is triggered when a client attempts to refresh their access token.
 * It performs the following logic:
 * 1. Looks up the refresh token in the repository
 * 2. Verifies its validity (expiration, user match, etc.)
 * 3. If valid, issues a new session (access + refresh token)
 * 4. If invalid, revokes the token and throws a BusinessError
 *
 * @param deps - Injected dependencies:
 *   - `findRefreshTokenFn`: Retrieves the refresh token domain object from storage
 *   - `verifyRefreshTokenFn`: Checks the integrity and expiration of the token
 *   - `createAuthSessionFn`: Creates a new authentication session
 *   - `revokeRefreshTokenFn`: Deletes the token if invalid
 *
 * @returns A new session with `authToken`, `refreshToken`, and `user_id`
 * @throws BusinessError:
 *   - `TOKEN_NOT_FOUND` (401): if the token is not found
 *   - `INVALID_TOKENS` (401): if the token is invalid or revoked
 *
 * @example
 * const useCase = createRefreshSessionUseCase(deps);
 * const result = await useCase({ refreshToken: 'refreshToken_xyz' });
 */
@Injectable()
export class RefreshSessionUseCase {
  constructor(
    @Inject(REFRESH_TOKEN_REPO) private readonly refreshTokenRepo: IRefreshTokenRepository,
    @Inject(REFRESH_TOKEN_SERVICE) private readonly refreshTokenService: IAbstractRefreshTokenService,
    @Inject(AUTH_SERVICE) private readonly authService: IAuthTokenService,
  ){}

  async execute(input: any) {
    const { refreshToken } = input;

    const token = await this.refreshTokenRepo.findOne({ filter: { refreshToken } });

    if (!token) {
      throw new BusinessError('Refresh token not found', 'TOKEN_NOT_FOUND', 401);
    }

    const isValid = this.refreshTokenService.verifyRefreshToken({ refreshTokenDomainModel: token });

    if (!isValid) {
      await this.refreshTokenRepo.deleteOne({ refreshToken });
      throw new BusinessError('Invalid tokens', 'INVALID_TOKENS', 401);
    }

    const session = await this.authService.createAuthSession({ user_id: token.user_id });

    return {
      ...session,
      user_id: token.user_id,
    };
  }
}
