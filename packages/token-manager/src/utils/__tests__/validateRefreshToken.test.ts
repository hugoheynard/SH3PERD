import type { TRefreshTokenRecord } from '@sh3pherd/auth'
import {validateRefreshToken} from "../validateRefreshToken";

describe('validateRefreshToken', () => {
    const baseToken = {
        refreshToken: 'refreshToken_test123',
        user_id: 'user_abc',
        createdAt: new Date()
    } as const

    it('should return true if token is not expired', () => {
        const futureToken: TRefreshTokenRecord = {
            ...baseToken,
            expiresAt: new Date(Date.now() + 1000 * 60 * 10) // +10 min
        }

        expect(validateRefreshToken({ refreshToken: futureToken })).toBe(true)
    })

    it('should return false if token is expired', () => {
        const pastToken: TRefreshTokenRecord = {
            ...baseToken,
            expiresAt: new Date(Date.now() - 1000 * 60 * 10) // -10 min
        }

        expect(validateRefreshToken({ refreshToken: pastToken })).toBe(false)
    })
});
