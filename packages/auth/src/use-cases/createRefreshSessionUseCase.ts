import type {
    IAuthTokenService,
    TCreateAuthSessionResult,
    TRefreshToken, TRefreshTokenDomainModel, TUserId,
} from "@sh3pherd/shared-types";
import {BusinessError} from "@sh3pherd/shared-utils";

export const createRefreshSessionUseCase = (deps: {
    authTokenService: IAuthTokenService,
    findRefreshTokenFn: (input: { refreshToken: TRefreshToken }) => Promise<TRefreshTokenDomainModel | null>,
}) => {

    return async function refreshSessionUseCase(input:  { authToken: string; refreshToken: TRefreshToken }): Promise<TCreateAuthSessionResult & { user_id: TUserId }> {
        const { authToken, refreshToken } = input;

        // Verify the access token
        const decodedAuthToken = await deps.authTokenService.verifyAuthToken({ authToken });


        if (decodedAuthToken) {
            // If the access token is valid, return it
            return {
                authToken,
                refreshToken: null,
                refreshTokenSecureCookie: null
            };
        }
        const refreshTokenDomainModel = await deps.findRefreshTokenFn({ refreshToken });


        // Verify the refresh token
        const isValidRefresh = deps.authTokenService.findAndVerifyRefreshToken({ refreshTokenDomainModel });

        // If refresh token is valid, generate a new authSession
        if (!isValidRefresh) {
            throw new BusinessError('Invalid tokens', 'INVALID_TOKENS',  401);
        }

        return {
            ...await deps.authTokenService.createAuthSession({user_id: refreshTokenDomainModel.user_id}),
            user_id: refreshTokenDomainModel.user_id,
        };
    };
}