import type {IRefreshTokenRepository, TRefreshToken, TRefreshTokenRecord} from '@sh3pherd/auth'
import type { UserId } from '@sh3pherd/user'
import {RefreshTokenManager} from "../RefreshTokenManager";
import { jest } from '@jest/globals';

describe('RefreshTokenManager', () => {
    const mockToken: TRefreshToken = 'refreshToken_abc123'
    const mockUserId: UserId = 'user_123' as UserId
    const ttlMs: number = 1000 * 60 * 60 * 24

    const generatorFunction = jest.fn(async () => mockToken) as jest.MockedFunction<() => Promise<TRefreshToken>>

    const validateRefreshTokenFunction = jest.fn(async () => true) as jest.MockedFunction<
        (input: { refreshToken: TRefreshToken }) => Promise<boolean>>

    const repositoryMock: IRefreshTokenRepository = {
        saveRefreshToken: jest.fn(async () => ({ success: true })),
        revokeRefreshToken: jest.fn(async (input: { refreshToken: TRefreshToken }) => ({ revokedToken: input.refreshToken })),
        findRefreshToken: jest.fn(async (input: { refreshToken: TRefreshToken }): Promise<TRefreshTokenRecord | null> => ({
            refreshToken: input.refreshToken,
            user_id: mockUserId,
            expiresAt: new Date(Date.now() + ttlMs),
            createdAt: new Date()
        })),
    }

    const manager = new RefreshTokenManager({
        refreshTokenRepository: repositoryMock,
        generatorFunction,
        validateRefreshTokenFunction,
        ttlMs
    })

    it('should generate a valid refresh token', async () => {
        const token = await manager.generateRefreshToken({ user_id: mockUserId })

        expect(token).toBe(mockToken)
        expect(repositoryMock.saveRefreshToken).toHaveBeenCalledWith({
            refreshTokenRecord: expect.objectContaining({
                refreshToken: mockToken,
                user_id: mockUserId,
                expiresAt: expect.any(Date),
                createdAt: expect.any(Date)
            })
        })
    })

    it('should verify a refresh token as valid', async () => {
        const result = await manager.verifyRefreshToken({ refreshToken: mockToken })
        expect(result).toBe(true)
        expect(validateRefreshTokenFunction).toHaveBeenCalledWith({ refreshToken: mockToken })
    })

    it('should revoke a refresh token', async () => {
        const result = await manager.revokeRefreshToken({ refreshToken: mockToken })
        expect(result).toEqual({ revokedToken: mockToken })
        expect(repositoryMock.revokeRefreshToken).toHaveBeenCalledWith({ refreshToken: mockToken })
    })

    it('should return false if refresh token is invalid', async () => {
        validateRefreshTokenFunction.mockResolvedValueOnce(false)
        const result = await manager.verifyRefreshToken({ refreshToken: mockToken })
        expect(result).toBe(false)
    })

    it('should throw if token generation fails', async () => {
        generatorFunction.mockResolvedValueOnce(undefined as unknown as TRefreshToken)
        await expect(manager.generateRefreshToken({ user_id: mockUserId })).rejects.toThrow("Failed to generate refresh token")
    })


})
