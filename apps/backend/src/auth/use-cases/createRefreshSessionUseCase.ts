import type {TRefreshSessionUseCase, TRefreshSessionUseCaseDeps} from "../types/auth.core.useCase.js";
import {BusinessError} from "../../utils/errorManagement/errorClasses/BusinessError.js";


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
export const createRefreshSessionUseCase = (
    deps: TRefreshSessionUseCaseDeps
): TRefreshSessionUseCase => {
    const { findRefreshTokenFn, verifyRefreshTokenFn, createAuthSessionFn, deleteRefreshTokenFn } = deps;

    return async ({ refreshToken }) => {
        const token = await findRefreshTokenFn({ refreshToken });

        if (!token) {
            throw new BusinessError('Refresh token not found', 'TOKEN_NOT_FOUND', 401);
        }

        const isValid = verifyRefreshTokenFn({ refreshTokenDomainModel: token });

        if (!isValid) {
            await deleteRefreshTokenFn({ refreshToken });
            throw new BusinessError('Invalid tokens', 'INVALID_TOKENS', 401);
        }

        const session = await createAuthSessionFn({ user_id: token.user_id });

        return {
            ...session,
            user_id: token.user_id,
        };
    };
};
