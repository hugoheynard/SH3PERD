import { RefreshSessionCommand, RefreshSessionHandler } from '../../application/commands/RefreshSessionCommand';
import {
  userId,
  refreshTokenId,
  mockRefreshTokenRepo,
  mockRefreshTokenService,
  mockAuthService,
  makeRefreshTokenRecord,
  makeExpiredRefreshToken,
  makeRevokedRefreshToken,
  makeSessionResult,
} from '../test-helpers';
import { BusinessError } from '../../../utils/errorManagement/errorClasses/BusinessError';

describe('RefreshSessionHandler', () => {
  function createHandler() {
    const refreshTokenRepo = mockRefreshTokenRepo();
    const refreshTokenService = mockRefreshTokenService();
    const authService = mockAuthService();

    const handler = new (RefreshSessionHandler as any)(
      refreshTokenRepo,
      refreshTokenService,
      authService,
    ) as RefreshSessionHandler;

    return { handler, refreshTokenRepo, refreshTokenService, authService };
  }

  describe('execute — success (rotation)', () => {
    it('should rotate: revoke old token and create new session in same family', async () => {
      const token = makeRefreshTokenRecord({ family_id: 'family-A' });
      const { handler, refreshTokenRepo, authService } = createHandler();
      refreshTokenRepo.findOne.mockResolvedValue(token);

      const result = await handler.execute(new RefreshSessionCommand(token.refreshToken));

      // Old token marked as revoked
      expect(refreshTokenRepo.updateOne).toHaveBeenCalledWith(
        expect.objectContaining({
          filter: { refreshToken: token.refreshToken },
          update: { $set: { isRevoked: true } },
        }),
      );

      // New session created with same family_id
      expect(authService.rotateSession).toHaveBeenCalledWith({
        user_id: token.user_id,
        family_id: 'family-A',
      });

      expect(result.authToken).toBeDefined();
      expect(result.user_id).toBe(token.user_id);
      expect(result.refreshTokenSecureCookie).toBeDefined();
    });
  });

  describe('execute — token not found', () => {
    it('should throw TOKEN_NOT_FOUND (401)', async () => {
      const { handler, refreshTokenRepo } = createHandler();
      refreshTokenRepo.findOne.mockResolvedValue(null);

      try {
        await handler.execute(new RefreshSessionCommand(refreshTokenId()));
        fail('Should have thrown');
      } catch (e) {
        expect(e).toBeInstanceOf(BusinessError);
        expect((e as BusinessError).errorCode).toBe('TOKEN_NOT_FOUND');
        expect((e as BusinessError).statusCode).toBe(401);
      }
    });
  });

  describe('execute — token reuse detection (theft)', () => {
    it('should delete entire family and throw TOKEN_REUSE_DETECTED when token is revoked', async () => {
      const revokedToken = makeRevokedRefreshToken({ family_id: 'family-B' });
      const { handler, refreshTokenRepo } = createHandler();
      refreshTokenRepo.findOne.mockResolvedValue(revokedToken);

      try {
        await handler.execute(new RefreshSessionCommand(revokedToken.refreshToken));
        fail('Should have thrown');
      } catch (e) {
        expect(e).toBeInstanceOf(BusinessError);
        expect((e as BusinessError).errorCode).toBe('TOKEN_REUSE_DETECTED');
        expect((e as BusinessError).statusCode).toBe(401);
      }

      // Entire family should be deleted
      expect(refreshTokenRepo.deleteMany).toHaveBeenCalledWith({ family_id: 'family-B' });
    });
  });

  describe('execute — expired token', () => {
    it('should delete expired token and throw INVALID_TOKENS', async () => {
      const expired = makeExpiredRefreshToken();
      const { handler, refreshTokenRepo, refreshTokenService } = createHandler();
      refreshTokenRepo.findOne.mockResolvedValue(expired);
      refreshTokenService.verifyRefreshToken.mockReturnValue(false);

      try {
        await handler.execute(new RefreshSessionCommand(expired.refreshToken));
        fail('Should have thrown');
      } catch (e) {
        expect(e).toBeInstanceOf(BusinessError);
        expect((e as BusinessError).errorCode).toBe('INVALID_TOKENS');
      }

      expect(refreshTokenRepo.deleteOne).toHaveBeenCalledWith({ refreshToken: expired.refreshToken });
    });
  });

  describe('execute — does NOT call createAuthSession (uses rotateSession)', () => {
    it('should use rotateSession instead of createAuthSession', async () => {
      const token = makeRefreshTokenRecord();
      const { handler, refreshTokenRepo, authService } = createHandler();
      refreshTokenRepo.findOne.mockResolvedValue(token);

      await handler.execute(new RefreshSessionCommand(token.refreshToken));

      expect(authService.rotateSession).toHaveBeenCalled();
      expect(authService.createAuthSession).not.toHaveBeenCalled();
    });
  });
});
