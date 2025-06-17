import type {TLogoutUseCase, TLogoutUseCaseDeps} from "../types/auth.core.useCase.js";
import {BusinessError} from "../../utils/errorManagement/errorClasses/BusinessError.js";


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
export const createLogoutUseCase = (deps: TLogoutUseCaseDeps): TLogoutUseCase => {
    return async (input) => {
        if (input.refreshToken) {
            const success = await deps.deleteRefreshTokenFn({ refreshToken: input.refreshToken });

            // Si le token n’existe pas ou n’est pas valide
            if (!success) {
                if (input.user_id) {
                    await deps.deleteAllRefreshTokensForUserFn({ user_id: input.user_id });
                    return true;
                }

                throw new BusinessError(
                  'Invalid refresh token and no user_id provided to fallback cleanup',
                  'INVALID_REFRESH_TOKEN',
                  401
                );
            }

            return true;
        }

        if (input.user_id) {
            await deps.deleteAllRefreshTokensForUserFn({ user_id: input.user_id });
            return true;
        }

        throw new BusinessError('Missing logout input', 'MISSING_LOGOUT_INPUT', 400);
    };
};



