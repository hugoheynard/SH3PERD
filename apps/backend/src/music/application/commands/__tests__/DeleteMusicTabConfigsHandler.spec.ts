import {
  DeleteMusicTabConfigsCommand,
  DeleteMusicTabConfigsHandler,
} from '../DeleteMusicTabConfigsCommand.js';
import { userId } from '../../../domain/__tests__/test-helpers.js';
import { mockAnalytics } from './handler-test-helpers.js';
import type { IMusicTabConfigsRepository } from '../../../repositories/MusicTabConfigsRepository.js';

function mockTabRepo(): jest.Mocked<Pick<IMusicTabConfigsRepository, 'deleteByUserId'>> {
  return { deleteByUserId: jest.fn() };
}

function setup(opts: { ok?: boolean } = {}) {
  const repo = mockTabRepo();
  const analytics = mockAnalytics();
  repo.deleteByUserId.mockResolvedValue(opts.ok ?? true);
  const handler = new DeleteMusicTabConfigsHandler(repo as never, analytics as never);
  return { handler, repo, analytics };
}

describe('DeleteMusicTabConfigsHandler', () => {
  it('delegates to the repository and returns its result', async () => {
    const { handler, repo } = setup();
    const result = await handler.execute(new DeleteMusicTabConfigsCommand(userId()));
    expect(repo.deleteByUserId).toHaveBeenCalledWith(userId());
    expect(result).toBe(true);
  });

  it('emits music_tab_configs_deleted when the repo confirms the delete', async () => {
    const { handler, analytics } = setup({ ok: true });
    await handler.execute(new DeleteMusicTabConfigsCommand(userId()));
    expect(analytics.track).toHaveBeenCalledWith('music_tab_configs_deleted', userId(), {});
  });

  it('does not emit analytics when there is nothing to delete', async () => {
    const { handler, analytics } = setup({ ok: false });
    const result = await handler.execute(new DeleteMusicTabConfigsCommand(userId()));
    expect(result).toBe(false);
    expect(analytics.track).not.toHaveBeenCalled();
  });
});
