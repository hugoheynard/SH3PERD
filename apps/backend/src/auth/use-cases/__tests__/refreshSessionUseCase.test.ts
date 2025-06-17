
import { jest } from '@jest/globals';
import type { TCreateAuthSessionResult, TRefreshToken, TRefreshTokenDomainModel } from '../../types/auth.domain.tokens';
import type { TRefreshSessionUseCaseDeps } from '../../types/auth.core.useCase';
import type { TCreateAuthSessionFn, TFindRefreshTokenFn } from '../../types/auth.core.contracts';
import type { TRevokeRefreshTokenFn, TVerifyRefreshTokenFn } from '../../types/auth.core.tokens.contracts';
import { createRefreshSessionUseCase } from '../createRefreshSessionUseCase';
import { BusinessError } from '../../../utils/errorManagement/errorClasses/BusinessError';

describe('createRefreshSessionUseCase', () => {
    const refreshToken: TRefreshToken = 'refreshToken_test';
    const tokenRecord: TRefreshTokenDomainModel = {
        refreshToken,
        user_id: 'user_001',
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + 1000 * 60 * 60),
    };

    const session: TCreateAuthSessionResult = {
        authToken: 'new.jwt.token',
        refreshToken: 'refreshToken_new-refresh-token',
        refreshTokenSecureCookie: {
            name: 'sh3pherd_refreshToken',
            value: 'refreshToken_new-refresh-token',
            options: {
                httpOnly: true,
                secure: true,
                sameSite: 'strict',
                path: '/',
                maxAge: 604800
            }
        }
    };

    const deps: TRefreshSessionUseCaseDeps = {
        findRefreshTokenFn: jest.fn<TFindRefreshTokenFn>().mockResolvedValue(tokenRecord),
        verifyRefreshTokenFn: jest.fn<TVerifyRefreshTokenFn>().mockReturnValue(true),
        createAuthSessionFn: jest.fn<TCreateAuthSessionFn>().mockResolvedValue(session),
        deleteRefreshTokenFn: jest.fn<TRevokeRefreshTokenFn>().mockResolvedValue({ revokedToken: refreshToken }),
    };

    const useCase = createRefreshSessionUseCase(deps);

    it('should return a new session when the refresh token is valid', async () => {
        const result = await useCase({ refreshToken });

        expect(result).toEqual({
            ...session,
            user_id: 'user_001',
        });

        expect(deps.findRefreshTokenFn).toHaveBeenCalledWith({ refreshToken });
        expect(deps.verifyRefreshTokenFn).toHaveBeenCalledWith({ refreshTokenDomainModel: tokenRecord });
        expect(deps.createAuthSessionFn).toHaveBeenCalledWith({ user_id: tokenRecord.user_id });
    });

    it('should throw BusinessError if refresh token is not found', async () => {
        deps.findRefreshTokenFn = jest.fn<TFindRefreshTokenFn>().mockResolvedValue(null);
        const invalidUseCase = createRefreshSessionUseCase(deps);

        await expect(invalidUseCase({ refreshToken })).rejects.toThrow(BusinessError);
        await expect(invalidUseCase({ refreshToken })).rejects.toThrow('Refresh token not found');
    });

    it('should revoke token and throw BusinessError if refresh token is invalid', async () => {
        deps.findRefreshTokenFn = jest.fn<TFindRefreshTokenFn>().mockResolvedValue(tokenRecord);
        deps.verifyRefreshTokenFn = jest.fn<TVerifyRefreshTokenFn>().mockReturnValue(false);
        const invalidUseCase = createRefreshSessionUseCase(deps);

        await expect(invalidUseCase({ refreshToken })).rejects.toThrow(BusinessError);
        await expect(deps.deleteRefreshTokenFn).toHaveBeenCalledWith({ refreshToken });
    });
});
