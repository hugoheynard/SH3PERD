import {BusinessError} from "@sh3pherd/shared-utils";
import type {TLogoutUseCase, TLogoutUseCaseDeps} from "@sh3pherd/shared-types";

/**
 * Factory function for the logout use case.
 *
 * This use case handles the logic of logging out a user by revoking their refresh token.
 *
 * 📌 Responsibilities:
 * - Validates that a refresh token is provided
 * - Calls the `revokeRefreshTokenFn` to remove the token from the database
 * - Throws a `BusinessError` if the token is missing or invalid/expired
 *
 * ❌ Does NOT handle HTTP cookie clearing — this must be handled at the controller level.
 *
 * @param deps - Dependencies including the function to revoke refresh tokens
 * @returns A function that logs out the user given a valid refresh token
 *
 * @throws BusinessError - If the refresh token is missing or invalid
 *
 * @example
 * const logoutUseCase = createLogoutUseCase({ revokeRefreshTokenFn });
 * await logoutUseCase({ refreshToken: 'refresh_abc123' });
 */
export const createLogoutUseCase = (deps: TLogoutUseCaseDeps): TLogoutUseCase => {

    return async (input) => {
        const { refreshToken } = input;

        if (!refreshToken) {
            throw new BusinessError(
                'Missing refresh token',
                'MISSING_REFRESH_TOKEN',
                400
            );
        }
        const success = await deps.revokeRefreshTokenFn({ refreshToken });

        if (!success) {
            throw new BusinessError('Invalid or expired refresh token', 'INVALID_REFRESH_TOKEN', 401);
        }

        return true;
    };
};
