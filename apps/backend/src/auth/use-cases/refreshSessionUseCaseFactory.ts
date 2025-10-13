import { BusinessError } from '../../utils/errorManagement/errorClasses/BusinessError.js';
import type { TCreateAuthSessionFn } from '../types/auth.core.contracts.js';
import type { TRefreshTokenSecureCookie } from '../types/auth.domain.tokens.js';
import type { TLoginResponseDTO, TRefreshSessionRequestDTO, TRefreshToken, TRefreshTokenRecord } from '@sh3pherd/shared-types';
import type { TGenericRepoFindOneFn } from '../../utils/repoAdaptersHelpers/repository.genericFunctions.types.js';
import type { TVerifyRefreshTokenFn } from '../core/token-manager/RefreshTokenManager.js';

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
export function refreshSessionUseCaseFactory (deps: TRefreshSessionUseCaseDeps): TRefreshSessionUseCase {
  const { findOneFn, verifyRefreshTokenFn, createAuthSessionFn, deleteOneFn } = deps;

  return async (input) => {
    const { refreshToken } = input;

    const token = await findOneFn({ filter: { refreshToken } });

    if (!token) {
      throw new BusinessError('Refresh token not found', 'TOKEN_NOT_FOUND', 401);
    }

    const isValid = verifyRefreshTokenFn({ refreshTokenDomainModel: token });

    if (!isValid) {
      await deleteOneFn({ refreshToken });
      throw new BusinessError('Invalid tokens', 'INVALID_TOKENS', 401);
    }

    const session = await createAuthSessionFn({ user_id: token.user_id });

    return {
      ...session,
      user_id: token.user_id,
    };
  };
};
