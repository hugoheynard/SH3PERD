import { RefreshSessionCommand, RefreshSessionHandler } from '../RefreshSessionCommand.js';
import {
  refreshTokenId,
  mockRefreshTokenRepo,
  mockRefreshTokenService,
  mockAuthService,
  makeRefreshTokenRecord,
  makeExpiredRefreshToken,
  makeRevokedRefreshToken,
} from '../../../__tests__/test-helpers.js';
import { BusinessError } from '../../../../utils/errorManagement/BusinessError.js';
import { hashToken } from '../../../core/token-manager/hashToken.js';

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
      const rawToken = refreshTokenId();
      const token = makeRefreshTokenRecord({ family_id: 'family-A', refreshToken: rawToken });
      const hashedValue = hashToken(rawToken);
      const { handler, refreshTokenRepo, authService } = createHandler();
      refreshTokenRepo.findOne.mockResolvedValue(token);

      const result = await handler.execute(new RefreshSessionCommand(rawToken));

      // Old token marked as revoked (handler hashes the raw cookie token)
      expect(refreshTokenRepo.updateOne).toHaveBeenCalledWith(
        expect.objectContaining({
          filter: { refreshToken: hashedValue },
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

  /* ── Lookup contract: findOne must hash before querying ──
   * Storing raw refresh tokens in Mongo would let a DB leak cascade
   * into active sessions. The handler's lookup must therefore hash the
   * cookie value BEFORE the repo query — if someone regresses this
   * (e.g. copies the raw value into the filter), the DB is queried
   * with the cookie, which will never match and silently produce 401
   * on every refresh. These assertions lock the hashing into the
   * contract rather than relying on the filter-matching in updateOne
   * to surface the mismatch. */
  describe('execute — lookup contract', () => {
    it('should look up by the hashed token, not the raw cookie value', async () => {
      const rawToken = refreshTokenId();
      const hashedValue = hashToken(rawToken);
      const record = makeRefreshTokenRecord({ refreshToken: rawToken });
      const { handler, refreshTokenRepo } = createHandler();
      refreshTokenRepo.findOne.mockResolvedValue(record);

      await handler.execute(new RefreshSessionCommand(rawToken));

      expect(refreshTokenRepo.findOne).toHaveBeenCalledWith({
        filter: { refreshToken: hashedValue },
      });
      expect(refreshTokenRepo.findOne).not.toHaveBeenCalledWith({
        filter: { refreshToken: rawToken },
      });
    });

    it('should hash before looking up when the token is revoked (theft path still uses hashed lookup)', async () => {
      // Regression guard: the theft-detection branch must not bypass
      // hashing. If it did, the raw cookie would reach the DB on any
      // post-logout replay and the handler would mis-classify.
      const rawToken = refreshTokenId();
      const hashedValue = hashToken(rawToken);
      const revoked = makeRevokedRefreshToken({ refreshToken: rawToken });
      const { handler, refreshTokenRepo } = createHandler();
      refreshTokenRepo.findOne.mockResolvedValue(revoked);

      await expect(handler.execute(new RefreshSessionCommand(rawToken))).rejects.toThrow(
        BusinessError,
      );

      expect(refreshTokenRepo.findOne).toHaveBeenCalledWith({
        filter: { refreshToken: hashedValue },
      });
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
        expect((e as BusinessError).code).toBe('TOKEN_NOT_FOUND');
        expect((e as BusinessError).status).toBe(401);
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
        expect((e as BusinessError).code).toBe('TOKEN_REUSE_DETECTED');
        expect((e as BusinessError).status).toBe(401);
      }

      // Entire family should be deleted
      expect(refreshTokenRepo.deleteMany).toHaveBeenCalledWith({ family_id: 'family-B' });
    });
  });

  describe('execute — expired token', () => {
    it('should delete expired token and throw INVALID_TOKENS', async () => {
      const rawToken = refreshTokenId();
      const expired = makeExpiredRefreshToken({ refreshToken: rawToken });
      const hashedValue = hashToken(rawToken);
      const { handler, refreshTokenRepo, refreshTokenService } = createHandler();
      refreshTokenRepo.findOne.mockResolvedValue(expired);
      refreshTokenService.verifyRefreshToken.mockReturnValue(false);

      try {
        await handler.execute(new RefreshSessionCommand(rawToken));
        fail('Should have thrown');
      } catch (e) {
        expect(e).toBeInstanceOf(BusinessError);
        expect((e as BusinessError).code).toBe('INVALID_TOKENS');
      }

      expect(refreshTokenRepo.deleteOne).toHaveBeenCalledWith({
        refreshToken: hashedValue,
      });
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
