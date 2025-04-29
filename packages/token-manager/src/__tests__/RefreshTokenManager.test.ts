import { jest } from '@jest/globals';
import type {
    TDeleteRefreshToken,
    TRefreshToken,
    TRefreshTokenDomainModel,
    TRefreshTokenManagerDeps,
    TSaveRefreshToken,
    TUserId
} from "@sh3pherd/shared-types";
import {RefreshTokenManager} from "../RefreshTokenManager.js";


describe('RefreshTokenManager', () => {
    const mockUserId: TUserId = 'user_123' as TUserId
    const mockToken: TRefreshToken = 'refreshToken_abc123';
    const mockTokenRecord: TRefreshTokenDomainModel = {
        refreshToken: mockToken,
        user_id: mockUserId,
        expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24),
        createdAt: new Date()
    }
    const ttlMs_ONEDAY: number = 1000 * 60 * 60 * 24;

    const generatorFnMock = jest.fn(
        async () => mockToken) as jest.MockedFunction<() => Promise<TRefreshToken>>



    type ValidateFn = (input: { date: Date }) => boolean;
    const validateRefreshTokenDateFnMock = jest.fn<ValidateFn>();
    validateRefreshTokenDateFnMock.mockReturnValue(true);

    const saveRefreshTokenFnMock = jest.fn(async () => ({ success: true }));
    const deleteRefreshTokenFnMock = jest.fn(async (input: { refreshToken: TRefreshToken }) => ({ revokedToken: input.refreshToken }));

    //TODO FOR SERVICE
    const findRefreshTokenMock = jest.fn(async (input: { refreshToken: TRefreshToken }): Promise<TRefreshTokenDomainModel | null> => ({
        refreshToken: input.refreshToken,
        user_id: mockUserId,
        expiresAt: new Date(Date.now() + ttlMs_ONEDAY),
        createdAt: new Date()
    }));

    const deps = {
        generatorFn: generatorFnMock,
        validateRefreshTokenDateFn: validateRefreshTokenDateFnMock,
        saveRefreshTokenFn: saveRefreshTokenFnMock,
        deleteRefreshTokenFn: deleteRefreshTokenFnMock,
        ttlMs: ttlMs_ONEDAY
    } as TRefreshTokenManagerDeps;


    const sut = new RefreshTokenManager(deps);

    beforeEach(() => {
        jest.clearAllMocks(); // 🔄
    });

    /**
     * token generation
     * */
    it('should generate a valid refresh token', async () => {
        const token = await sut.generateRefreshToken({ user_id: mockUserId });

        expect(token).toBe(mockToken)
        expect(saveRefreshTokenFnMock).toHaveBeenCalledWith({
            refreshTokenDomainModel: expect.objectContaining({
                refreshToken: 'refreshToken_abc123',
                user_id: 'user_123',
                createdAt: expect.any(Date),
                expiresAt: expect.any(Date),
            }),
        });
    });

    /**
     * checks if the refresh token is valid or not
     * */

    it('should verify a refresh token as valid', () => {
        const validDateToken = {
            ...mockTokenRecord,
            expiresAt: new Date(Date.now() + ttlMs_ONEDAY)
        };

        const result = sut.verifyRefreshToken({ refreshTokenDomainModel: validDateToken });


        expect(typeof result).toBe('boolean');
        expect(result).toBe(true);
        expect(validateRefreshTokenDateFnMock).toHaveBeenCalledWith({ date: validDateToken.expiresAt });
    });

    it('should return false if refresh token is invalid', () => {
        validateRefreshTokenDateFnMock.mockReturnValueOnce(false);

        const result = sut.verifyRefreshToken({ refreshTokenDomainModel: mockTokenRecord });

        expect(typeof result).toBe('boolean');
        expect(result).toBe(false);
    });


    it('should revoke a refresh token', async () => {
        const result = await sut.revokeRefreshToken({ refreshToken: mockToken })
        expect(result).toEqual({ revokedToken: mockToken })
        expect(deleteRefreshTokenFnMock).toHaveBeenCalledWith({ refreshToken: mockToken })
    })


    it('should throw if token generation fails', async () => {
        generatorFnMock.mockResolvedValueOnce(undefined as unknown as TRefreshToken)
        await expect(sut.generateRefreshToken({ user_id: mockUserId })).rejects.toThrow("Failed to generate refresh token")
    })

    //error catching from repository layer
    it('should throw if saveRefreshToken throws', async () => {
        (saveRefreshTokenFnMock as jest.MockedFunction<TSaveRefreshToken>)
            .mockImplementationOnce(async () => {
                throw new Error('DB failure')
            });

        await expect(sut.generateRefreshToken({ user_id: mockUserId }))
            .rejects
            .toThrow(`Unable to save refresh token for user ${mockUserId}: DB failure`)
    });

    it('should throw if revokeRefreshToken throws', async () => {
        (deleteRefreshTokenFnMock as jest.MockedFunction<TDeleteRefreshToken>)
            .mockImplementationOnce(async () => {
                throw new Error('Revoke error')
            })

        await expect(sut.revokeRefreshToken({ refreshToken: mockToken }))
            .rejects
            .toThrow('Unable to revoke refresh token: Revoke error')
    });
});
