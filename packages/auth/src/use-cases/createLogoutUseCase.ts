import {BusinessError, TechnicalError} from "@sh3pherd/shared-utils";
import type {TLogoutUseCase, TLogoutUseCaseDeps} from "@sh3pherd/shared-types";


export const createLogoutUseCase = (deps: TLogoutUseCaseDeps): TLogoutUseCase => {
    return async (input) => {
        try {
            if (!input.refreshToken) {
                throw new BusinessError(
                    'Missing refresh token',
                    'MISSING_REFRESH_TOKEN',
                    400
                );
            }

            return await deps.revokeRefreshTokenFn(input);
        } catch (error) {
            throw new TechnicalError(
                'Failed to logout user',
                'LOGOUT_FAILED',
                500
            );
        }
    };
};
