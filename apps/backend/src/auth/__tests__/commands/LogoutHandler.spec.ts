import { LogoutCommand, LogoutHandler } from '../../application/commands/LogoutCommand';
import {
  userId,
  refreshTokenId,
  mockRefreshTokenRepo,
  makeRefreshTokenRecord,
} from '../test-helpers';

describe('LogoutHandler', () => {
  function createHandler() {
    const refreshTokenRepo = mockRefreshTokenRepo();
    const handler = new (LogoutHandler as any)(refreshTokenRepo) as LogoutHandler;
    return { handler, refreshTokenRepo };
  }

  describe('execute — with specific refresh token', () => {
    it('should find the token and delete its entire family', async () => {
      const token = makeRefreshTokenRecord({ family_id: 'family-X' });
      const { handler, refreshTokenRepo } = createHandler();
      refreshTokenRepo.findOne.mockResolvedValue(token);

      await handler.execute(new LogoutCommand(userId(), token.refreshToken));

      expect(refreshTokenRepo.findOne).toHaveBeenCalledWith({
        filter: { refreshToken: token.refreshToken },
      });
      expect(refreshTokenRepo.deleteMany).toHaveBeenCalledWith({ family_id: 'family-X' });
    });

    it('should do nothing if the token is not found in DB', async () => {
      const { handler, refreshTokenRepo } = createHandler();
      refreshTokenRepo.findOne.mockResolvedValue(null);

      await handler.execute(new LogoutCommand(userId(), refreshTokenId()));

      expect(refreshTokenRepo.deleteMany).not.toHaveBeenCalled();
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
