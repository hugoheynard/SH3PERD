import { RefreshTokenService } from '../RefreshTokenService.js';
import { hashToken } from '../hashToken.js';
import type { TSecureCookieConfig } from '../../../types/auth.domain.tokens.js';
import type { IRefreshTokenRepository } from '../../../repositories/RefreshTokenMongoRepository.js';
import type { TUserId, TRefreshTokenRecord } from '@sh3pherd/shared-types';

const mockUserId = 'user_test-rt' as TUserId;

const mockRepo: jest.Mocked<IRefreshTokenRepository> = {
  save: jest.fn().mockResolvedValue(true),
  findOne: jest.fn().mockResolvedValue(null),
  findMany: jest.fn().mockResolvedValue([]),
  updateOne: jest.fn().mockResolvedValue(null),
  deleteOne: jest.fn().mockResolvedValue(true),
  deleteMany: jest.fn().mockResolvedValue(true),
  startSession: jest.fn(),
} as any;

const mockCookieConfig: TSecureCookieConfig = {
  httpOnly: true,
  secure: false,
  sameSite: 'lax',
  maxAge: 604800000,
};

describe('RefreshTokenService', () => {
  let service: RefreshTokenService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new RefreshTokenService(mockRepo, mockCookieConfig);
  });

  describe('generateRefreshToken', () => {
    it('should generate a token with a new family_id when none provided', async () => {
      const token = await service.generateRefreshToken({ user_id: mockUserId });

      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(mockRepo.save).toHaveBeenCalledTimes(1);

      const savedRecord = mockRepo.save.mock.calls[0][0] as TRefreshTokenRecord;
      expect(savedRecord.user_id).toBe(mockUserId);
      expect(savedRecord.family_id).toBeDefined();
      expect(savedRecord.isRevoked).toBe(false);
    });

    it('should store the HASHED token, not the raw token', async () => {
      const rawToken = await service.generateRefreshToken({ user_id: mockUserId });
      const savedRecord = mockRepo.save.mock.calls[0][0] as TRefreshTokenRecord;

      // The stored refreshToken should be the hash of the raw token
      expect(savedRecord.refreshToken).toBe(hashToken(rawToken));
      expect(savedRecord.refreshToken).not.toBe(rawToken);
    });

    it('should use provided family_id for token rotation', async () => {
      await service.generateRefreshToken({ user_id: mockUserId, family_id: 'family-abc' });
      const savedRecord = mockRepo.save.mock.calls[0][0] as TRefreshTokenRecord;
      expect(savedRecord.family_id).toBe('family-abc');
    });

    it('should set expiresAt based on secureCookieConfig.maxAge', async () => {
      const before = Date.now();
      await service.generateRefreshToken({ user_id: mockUserId });
      const savedRecord = mockRepo.save.mock.calls[0][0] as TRefreshTokenRecord;

      const expectedExpiry = before + mockCookieConfig.maxAge;
      expect(savedRecord.expiresAt.getTime()).toBeGreaterThanOrEqual(expectedExpiry - 100);
      expect(savedRecord.expiresAt.getTime()).toBeLessThanOrEqual(expectedExpiry + 1000);
    });

    it('should throw TechnicalError when save fails', async () => {
      mockRepo.save.mockRejectedValueOnce(new Error('DB down'));

      await expect(service.generateRefreshToken({ user_id: mockUserId })).rejects.toThrow(
        'Unable to save refresh token',
      );
    });
  });

  describe('verifyRefreshToken', () => {
    it('should return true for a valid, non-revoked, non-expired token', () => {
      const result = service.verifyRefreshToken({
        refreshTokenDomainModel: {
          refreshToken: 'hashed-token',
          user_id: mockUserId,
          family_id: 'fam-1',
          isRevoked: false,
          expiresAt: new Date(Date.now() + 60_000),
          createdAt: new Date(),
        } as any,
      });
      expect(result).toBe(true);
    });

    it('should return false for an expired token', () => {
      const result = service.verifyRefreshToken({
        refreshTokenDomainModel: {
          refreshToken: 'hashed-token',
          user_id: mockUserId,
          family_id: 'fam-1',
          isRevoked: false,
          expiresAt: new Date(Date.now() - 1000),
          createdAt: new Date(),
        } as any,
      });
      expect(result).toBe(false);
    });

    it('should return false for a revoked token', () => {
      const result = service.verifyRefreshToken({
        refreshTokenDomainModel: {
          refreshToken: 'hashed-token',
          user_id: mockUserId,
          family_id: 'fam-1',
          isRevoked: true,
          expiresAt: new Date(Date.now() + 60_000),
          createdAt: new Date(),
        } as any,
      });
      expect(result).toBe(false);
    });
  });

  describe('revokeRefreshToken', () => {
    it('should hash the token then delete from DB', async () => {
      const rawToken = 'refreshToken_abc-123';
      const result = await service.revokeRefreshToken({ refreshToken: rawToken });

      expect(result).toEqual({ revokedToken: rawToken });
      expect(mockRepo.deleteOne).toHaveBeenCalledWith({
        refreshToken: hashToken(rawToken),
      });
    });

    it('should throw when deleteOne fails', async () => {
      mockRepo.deleteOne.mockRejectedValueOnce(new Error('DB error'));

      await expect(
        service.revokeRefreshToken({ refreshToken: 'refreshToken_fail' }),
      ).rejects.toThrow('Unable to revoke refresh token');
    });
  });

  describe('generateRefreshTokenCookie', () => {
    it('should return a properly configured secure cookie', () => {
      const cookie = service.generateRefreshTokenCookie({
        refreshToken: 'refreshToken_raw-value',
      });

      expect(cookie.name).toBe('sh3pherd_refreshToken');
      expect(cookie.value).toBe('refreshToken_raw-value');
      expect(cookie.options.httpOnly).toBe(true);
      expect(cookie.options.secure).toBe(false);
      expect(cookie.options.sameSite).toBe('lax');
      expect(cookie.options.path).toBe('/api/auth');
      expect(cookie.options.maxAge).toBe(604800000);
    });
  });
});
