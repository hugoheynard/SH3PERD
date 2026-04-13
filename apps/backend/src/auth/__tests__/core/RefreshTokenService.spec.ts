import { RefreshTokenService } from '../../core/token-manager/RefreshTokenService';
import {
  userId,
  refreshTokenId,
  mockRefreshTokenRepo,
  makeRefreshTokenRecord,
  makeExpiredRefreshToken,
  makeRevokedRefreshToken,
} from '../test-helpers';
import type { TSecureCookieConfig } from '../../types/auth.domain.tokens';

describe('RefreshTokenService', () => {
  const secureCookieConfig: TSecureCookieConfig = {
    httpOnly: true,
    secure: false,
    sameSite: 'lax',
    maxAge: 604800000,
  };

  function createService(repo = mockRefreshTokenRepo()) {
    const service = new RefreshTokenService(repo, secureCookieConfig);
    return { service, repo };
  }

  describe('generateRefreshToken', () => {
    it('should generate a token with a new family_id when none provided', async () => {
      const { service, repo } = createService();

      const token = await service.generateRefreshToken({ user_id: userId() });

      expect(token).toMatch(/^refreshToken_/);
      expect(repo.save).toHaveBeenCalledTimes(1);

      const savedRecord = (repo.save as jest.Mock).mock.calls[0][0];
      expect(savedRecord.family_id).toBeDefined();
      expect(savedRecord.isRevoked).toBe(false);
      expect(savedRecord.user_id).toBe(userId());
    });

    it('should use provided family_id for token rotation', async () => {
      const { service, repo } = createService();
      const familyId = 'existing-family';

      await service.generateRefreshToken({ user_id: userId(), family_id: familyId });

      const savedRecord = (repo.save as jest.Mock).mock.calls[0][0];
      expect(savedRecord.family_id).toBe(familyId);
    });

    it('should set expiresAt based on secureCookieConfig.maxAge', async () => {
      const { service, repo } = createService();
      const before = Date.now();

      await service.generateRefreshToken({ user_id: userId() });

      const savedRecord = (repo.save as jest.Mock).mock.calls[0][0];
      const expectedMin = before + secureCookieConfig.maxAge;
      expect(savedRecord.expiresAt.getTime()).toBeGreaterThanOrEqual(expectedMin - 100);
    });

    it('should throw TechnicalError when save fails', async () => {
      const repo = mockRefreshTokenRepo();
      repo.save.mockRejectedValue(new Error('DB connection lost'));
      const { service } = createService(repo);

      await expect(service.generateRefreshToken({ user_id: userId() })).rejects.toThrow(
        'Unable to save refresh token',
      );
    });
  });

  describe('verifyRefreshToken', () => {
    it('should return true for a valid, non-revoked, non-expired token', () => {
      const { service } = createService();
      const token = makeRefreshTokenRecord();

      expect(service.verifyRefreshToken({ refreshTokenDomainModel: token })).toBe(true);
    });

    it('should return false for an expired token', () => {
      const { service } = createService();
      const token = makeExpiredRefreshToken();

      expect(service.verifyRefreshToken({ refreshTokenDomainModel: token })).toBe(false);
    });

    it('should return false for a revoked token', () => {
      const { service } = createService();
      const token = makeRevokedRefreshToken();

      expect(service.verifyRefreshToken({ refreshTokenDomainModel: token })).toBe(false);
    });
  });

  describe('revokeRefreshToken', () => {
    it('should delete the token and return the revoked token id', async () => {
      const { service, repo } = createService();
      const token = refreshTokenId();

      const result = await service.revokeRefreshToken({ refreshToken: token });

      expect(repo.deleteOne).toHaveBeenCalledWith({ refreshToken: token });
      expect(result).toEqual({ revokedToken: token });
    });

    it('should throw when deleteOne fails', async () => {
      const repo = mockRefreshTokenRepo();
      repo.deleteOne.mockRejectedValue(new Error('DB error'));
      const { service } = createService(repo);

      await expect(service.revokeRefreshToken({ refreshToken: refreshTokenId() })).rejects.toThrow(
        'Unable to revoke refresh token',
      );
    });
  });

  describe('generateRefreshTokenCookie', () => {
    it('should return a properly configured secure cookie', () => {
      const { service } = createService();
      const token = refreshTokenId();

      const cookie = service.generateRefreshTokenCookie({ refreshToken: token });

      expect(cookie.name).toBe('sh3pherd_refreshToken');
      expect(cookie.value).toBe(token);
      expect(cookie.options.httpOnly).toBe(true);
      expect(cookie.options.sameSite).toBe('lax');
      expect(cookie.options.path).toBe('/api/auth/refresh');
      expect(cookie.options.maxAge).toBe(604800000);
    });
  });
});
