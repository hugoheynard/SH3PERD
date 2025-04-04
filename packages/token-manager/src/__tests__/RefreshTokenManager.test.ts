import type {IRefreshTokenRepository, TRefreshToken, TRefreshTokenRecord} from '@sh3pherd/auth'
import type { UserId } from '@sh3pherd/user'
import {RefreshTokenManager} from "../RefreshTokenManager";
import { jest } from '@jest/globals';

describe('RefreshTokenManager', () => {
    const mockUserId: UserId = 'user_123' as UserId
    const mockToken: TRefreshToken = 'refreshToken_abc123';
    const mockTokenRecord: TRefreshTokenRecord = {
        refreshToken: mockToken,
        user_id: mockUserId,
        expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24),
        createdAt: new Date()
    }
    const ttlMs_ONEDAY: number = 1000 * 60 * 60 * 24;

    const generatorFunction = jest.fn(
        async () => mockToken) as jest.MockedFunction<() => Promise<TRefreshToken>>


/*
    const validateRefreshTokenDateFunction = jest.fn(
        (_input: { expirationDate: Date }): boolean => true
    ) as jest.MockedFunction<(input: { expirationDate: Date }) => boolean>;
*/
    type ValidateFn = (input: { expirationDate: Date }) => boolean;
    const validateRefreshTokenDateFunction = jest.fn<ValidateFn>();
    validateRefreshTokenDateFunction.mockReturnValue(true);

    const repositoryMock: IRefreshTokenRepository = {
        saveRefreshToken: jest.fn(async () => ({ success: true })),
        revokeRefreshToken: jest.fn(async (input: { refreshToken: TRefreshToken }) => ({ revokedToken: input.refreshToken })),
        findRefreshToken: jest.fn(async (input: { refreshToken: TRefreshToken }): Promise<TRefreshTokenRecord | null> => ({
            refreshToken: input.refreshToken,
            user_id: mockUserId,
            expiresAt: new Date(Date.now() + ttlMs_ONEDAY),
            createdAt: new Date()
        })),
    };


    const sut = new RefreshTokenManager({
        refreshTokenRepository: repositoryMock,
        generatorFunction,
        validateRefreshTokenDateFunction: validateRefreshTokenDateFunction,
        ttlMs: ttlMs_ONEDAY
    });

    beforeEach(() => {
        jest.clearAllMocks(); // 🔄
    });

    /**
     * token generation
     * */
    it('should generate a valid refresh token', async () => {
        const token = await sut.generateRefreshToken({ user_id: mockUserId });

        expect(token).toBe(mockToken)
        expect(repositoryMock.saveRefreshToken).toHaveBeenCalledWith({
            refreshTokenRecord: expect.objectContaining({
                refreshToken: mockToken,
                user_id: mockUserId,
                expiresAt: expect.any(Date),
                createdAt: expect.any(Date)
            })
        });
    });

    /**
     * checks if the refresh token is valid or not
     * */
    it('🔎 debug direct: validateRefreshTokenDateFunction fonctionne', () => {
        const fn = jest.fn<(input: { expirationDate: Date }) => boolean>().mockReturnValue(true);
        const result = fn({ expirationDate: new Date() });
        console.log('✅ direct return:', result, 'type:', typeof result);
        expect(result).toBe(true);
    });
    it('should verify a refresh token as valid', () => {
        const validDateToken = {
            ...mockTokenRecord,
            expiresAt: new Date(Date.now() + ttlMs_ONEDAY)
        };

        const result = sut.verifyRefreshToken({ refreshTokenRecord: validDateToken });
        console.log('RESULT TYPE', typeof result, 'VALUE', result);

        expect(typeof result).toBe('boolean');
        expect(result).toBe(true);
        expect(validateRefreshTokenDateFunction).toHaveBeenCalledWith({ expirationDate: validDateToken.expiresAt });
    });

    it('should return false if refresh token is invalid', () => {
        validateRefreshTokenDateFunction.mockReturnValueOnce(false);

        const result = sut.verifyRefreshToken({ refreshTokenRecord: mockTokenRecord });

        expect(typeof result).toBe('boolean');
        expect(result).toBe(false);
    });


    it('should revoke a refresh token', async () => {
        const result = await sut.revokeRefreshToken({ refreshToken: mockToken })
        expect(result).toEqual({ revokedToken: mockToken })
        expect(repositoryMock.revokeRefreshToken).toHaveBeenCalledWith({ refreshToken: mockToken })
    })


    it('should throw if token generation fails', async () => {
        generatorFunction.mockResolvedValueOnce(undefined as unknown as TRefreshToken)
        await expect(sut.generateRefreshToken({ user_id: mockUserId })).rejects.toThrow("Failed to generate refresh token")
    })

    //error catching from repository layer
    it('should throw if saveRefreshToken throws', async () => {
        (repositoryMock.saveRefreshToken as jest.MockedFunction<IRefreshTokenRepository['saveRefreshToken']>)
            .mockImplementationOnce(async () => {
                throw new Error('DB failure')
            });

        await expect(sut.generateRefreshToken({ user_id: mockUserId }))
            .rejects
            .toThrow(`Unable to save refresh token for user ${mockUserId}: DB failure`)
    });

    it('should throw if revokeRefreshToken throws', async () => {
        (repositoryMock.revokeRefreshToken as jest.MockedFunction<IRefreshTokenRepository['revokeRefreshToken']>)
            .mockImplementationOnce(async () => {
                throw new Error('Revoke error')
            })

        await expect(sut.revokeRefreshToken({ refreshToken: mockToken }))
            .rejects
            .toThrow('Unable to revoke refresh token: Revoke error')
    });
});
