import { LogoutCommand, LogoutHandler } from '../../application/commands/LogoutCommand';
import {
  userId,
  refreshTokenId,
  mockRefreshTokenRepo,
  makeRefreshTokenRecord,
} from '../test-helpers';
import { hashToken } from '../../core/token-manager/hashToken.js';

describe('LogoutHandler', () => {
  function createHandler() {
    const refreshTokenRepo = mockRefreshTokenRepo();
    const handler = new (LogoutHandler as any)(refreshTokenRepo) as LogoutHandler;
    return { handler, refreshTokenRepo };
  }

  describe('execute — with specific refresh token', () => {
    it('should find the token and soft-delete its entire family', async () => {
      const rawToken = refreshTokenId();
      const token = makeRefreshTokenRecord({ family_id: 'family-X', refreshToken: rawToken });
      const hashedValue = hashToken(rawToken);
      const { handler, refreshTokenRepo } = createHandler();
      refreshTokenRepo.findOne.mockResolvedValue(token);

      await handler.execute(new LogoutCommand(userId(), rawToken));

      expect(refreshTokenRepo.findOne).toHaveBeenCalledWith({
        filter: { refreshToken: hashedValue },
      });
      expect(refreshTokenRepo.updateOne).toHaveBeenCalledWith({
        filter: { family_id: 'family-X' },
        update: { $set: { isRevoked: true } },
      });
    });

    it('should do nothing if the token is not found in DB', async () => {
      const { handler, refreshTokenRepo } = createHandler();
      refreshTokenRepo.findOne.mockResolvedValue(null);

      await handler.execute(new LogoutCommand(userId(), refreshTokenId()));

      expect(refreshTokenRepo.updateOne).not.toHaveBeenCalled();
    });
  });

  describe('execute — without refresh token (logout all devices)', () => {
    it('should delete all tokens for the user', async () => {
      const uid = userId(3);
      const { handler, refreshTokenRepo } = createHandler();

      await handler.execute(new LogoutCommand(uid));

      expect(refreshTokenRepo.deleteMany).toHaveBeenCalledWith({ user_id: uid });
      expect(refreshTokenRepo.findOne).not.toHaveBeenCalled();
    });
  });
});
