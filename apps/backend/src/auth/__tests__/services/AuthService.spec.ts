import { AuthService } from '../../services/auth.service';
import {
  userId,
  refreshTokenId,
  mockRefreshTokenRepo,
  mockJwtService,
  mockRefreshTokenService,
  makeSecureCookie,
} from '../test-helpers';

describe('AuthService', () => {
  function createService() {
    const refreshTokenService = mockRefreshTokenService();
    const jwtService = mockJwtService();
    const refreshRepo = mockRefreshTokenRepo();

    const service = new (AuthService as any)(refreshTokenService, jwtService, refreshRepo) as AuthService;

    return { service, refreshTokenService, jwtService, refreshRepo };
  }

  describe('createAuthSession', () => {
    it('should delete all previous refresh tokens for the user', async () => {
      const { service, refreshRepo } = createService();
      const uid = userId();

      await service.createAuthSession({ user_id: uid });

      expect(refreshRepo.deleteMany).toHaveBeenCalledWith({ user_id: uid });
    });

    it('should generate a new auth token and refresh token', async () => {
      const { service, jwtService, refreshTokenService } = createService();
      const uid = userId();

      const result = await service.createAuthSession({ user_id: uid });

      expect(jwtService.generateAuthToken).toHaveBeenCalledWith({ payload: { user_id: uid } });
      expect(refreshTokenService.generateRefreshToken).toHaveBeenCalledWith({ user_id: uid });
      expect(refreshTokenService.generateRefreshTokenCookie).toHaveBeenCalled();
      expect(result.authToken).toBeDefined();
      expect(result.refreshToken).toBeDefined();
      expect(result.refreshTokenSecureCookie).toBeDefined();
    });
  });

  describe('rotateSession', () => {
    it('should generate tokens with the same family_id', async () => {
      const { service, jwtService, refreshTokenService } = createService();
      const uid = userId();
      const familyId = 'family-123';

      await service.rotateSession({ user_id: uid, family_id: familyId });

      expect(jwtService.generateAuthToken).toHaveBeenCalledWith({ payload: { user_id: uid } });
      expect(refreshTokenService.generateRefreshToken).toHaveBeenCalledWith({
        user_id: uid,
        family_id: familyId,
      });
    });

    it('should NOT delete existing tokens (unlike createAuthSession)', async () => {
      const { service, refreshRepo } = createService();

      await service.rotateSession({ user_id: userId(), family_id: 'family-123' });

      expect(refreshRepo.deleteMany).not.toHaveBeenCalled();
    });

    it('should return auth token, refresh token, and cookie', async () => {
      const { service } = createService();

      const result = await service.rotateSession({ user_id: userId(), family_id: 'family-123' });

      expect(result.authToken).toBe('jwt-test-token');
      expect(result.refreshToken).toBeDefined();
      expect(result.refreshTokenSecureCookie).toBeDefined();
    });
  });

  describe('verifyAuthToken', () => {
    it('should delegate to jwtService', async () => {
      const { service, jwtService } = createService();

      const result = await service.verifyAuthToken({ authToken: 'some-jwt' });

      expect(jwtService.verifyAuthToken).toHaveBeenCalledWith({ authToken: 'some-jwt' });
      expect(result).toEqual({ user_id: userId() });
    });

    it('should return null for invalid token', async () => {
      const { service, jwtService } = createService();
      jwtService.verifyAuthToken.mockResolvedValue(null);

      const result = await service.verifyAuthToken({ authToken: 'bad-jwt' });

      expect(result).toBeNull();
    });
  });

  describe('revokeRefreshToken', () => {
    it('should delegate to refreshTokenService', async () => {
      const { service, refreshTokenService } = createService();
      const token = refreshTokenId();

      const result = await service.revokeRefreshToken({ refreshToken: token });

      expect(refreshTokenService.revokeRefreshToken).toHaveBeenCalledWith({ refreshToken: token });
      expect(result).toEqual({ revokedToken: expect.any(String) });
    });
  });
});
