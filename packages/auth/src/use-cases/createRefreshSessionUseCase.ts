import type {
    IAuthTokenService,
    TRefreshSessionUseCase,
} from "@sh3pherd/shared-types";
import {BusinessError, TechnicalError} from "@sh3pherd/shared-utils";


export const createRefreshSessionUseCase = (deps: { authTokenService: IAuthTokenService, }) => {

    const refreshSessionUseCase: TRefreshSessionUseCase = async (input) => {
        try {
            const { verifyRefreshToken, createAuthSession } = deps.authTokenService;
            const { refreshToken } = input;
            console.log('[refreshSessionUseCase] - refreshToken', refreshToken);

            // Find and verify the refresh token
            const {
                isValid,
                user_id
            } = await verifyRefreshToken({ refreshToken });

            // If refresh token is valid, generate a new authSession
            if (!isValid || !user_id) {
                throw new BusinessError('Invalid tokens', 'INVALID_TOKENS',  401);
            }

            return {
                ...await createAuthSession({ user_id }),
                user_id,
            };
        } catch (e) {
            if (e instanceof BusinessError) {
                throw e;
            }
            throw new TechnicalError(
                '[refreshSessionUseCase] - Error creating refresh session',
                'CREATE_REFRESH_SESSION_ERROR',
                500);
        }
    };

    return refreshSessionUseCase;
}