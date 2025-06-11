import { BusinessError } from '@sh3pherd/shared-utils';
import {createLogoutUseCase} from "../createLogoutUseCase.js";
import { jest } from '@jest/globals';
import type {TRevokeRefreshTokenFn} from "@sh3pherd/shared-types";

describe('createLogoutUseCase', () => {
    const mockRevokeRefreshTokenFn: jest.MockedFunction<TRevokeRefreshTokenFn> = jest.fn();


    const logoutUseCase = createLogoutUseCase({
        revokeRefreshTokenFn: mockRevokeRefreshTokenFn,
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should revoke refresh token and return true on success', async () => {
        const VALID_TOKEN = 'refreshToken_valid123' as const;
        mockRevokeRefreshTokenFn.mockResolvedValueOnce({ revokedToken: VALID_TOKEN });



        const result = await logoutUseCase({ refreshToken: VALID_TOKEN });

        expect(result).toBe(true);
        expect(mockRevokeRefreshTokenFn).toHaveBeenCalledWith({ refreshToken: 'refreshToken_valid123' });
    });

    it('should throw BusinessError if refresh token is missing', async () => {
        await expect(logoutUseCase({ refreshToken: undefined as any }))
            .rejects.toThrow(BusinessError);

        await expect(logoutUseCase({ refreshToken: undefined as any }))
            .rejects.toMatchObject({
                errorCode: 'MISSING_REFRESH_TOKEN',
                statusCode: 400,
            });
    });

    it('should throw BusinessError if revocation fails', async () => {
        mockRevokeRefreshTokenFn.mockResolvedValueOnce(false);

        await expect(logoutUseCase({ refreshToken: 'refreshToken_invalid_token' }))
            .rejects.toThrow(BusinessError);

        await expect(logoutUseCase({ refreshToken: 'refreshToken_invalid_token' }))
            .rejects.toMatchObject({
                errorCode: 'INVALID_REFRESH_TOKEN',
                statusCode: 401,
            });
    });
});
