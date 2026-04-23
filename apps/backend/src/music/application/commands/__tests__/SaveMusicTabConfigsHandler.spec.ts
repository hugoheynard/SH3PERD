import {
  SaveMusicTabConfigsCommand,
  SaveMusicTabConfigsHandler,
  type TSaveMusicTabConfigsPayload,
} from '../SaveMusicTabConfigsCommand.js';
import { userId } from '../../../domain/__tests__/test-helpers.js';
import { mockAnalytics, mockQuotaService } from './handler-test-helpers.js';
import type { IMusicTabConfigsRepository } from '../../../repositories/MusicTabConfigsRepository.js';
import type {
  TMusicTabConfig,
  TMusicSavedTabConfig,
  TMusicTabConfigsDomainModel,
} from '@sh3pherd/shared-types';

function mockTabRepo(): jest.Mocked<Pick<IMusicTabConfigsRepository, 'findByUserId' | 'upsert'>> {
  return {
    findByUserId: jest.fn(),
    upsert: jest.fn().mockResolvedValue(true),
  };
}

const tab = (id: string): TMusicTabConfig =>
  ({ id, title: id, autoTitle: false, searchConfig: {} as never }) as TMusicTabConfig;
const savedCfg = (id: string): TMusicSavedTabConfig => ({
  id,
  name: id,
  tabs: [tab('t1')],
  activeTabId: 't1',
  createdAt: 0,
});

function makePayload(over: Partial<TSaveMusicTabConfigsPayload> = {}): TSaveMusicTabConfigsPayload {
  return {
    tabs: [tab('t1')],
    activeTabId: 't1',
    savedTabConfigs: [],
    ...over,
  };
}

function setup(
  opts: { existing?: Partial<TMusicTabConfigsDomainModel> | null; upsertOk?: boolean } = {},
) {
  const repo = mockTabRepo();
  const quota = mockQuotaService();
  const analytics = mockAnalytics();

  repo.findByUserId.mockResolvedValue(
    (opts.existing as TMusicTabConfigsDomainModel | null) ?? null,
  );
  repo.upsert.mockResolvedValue(opts.upsertOk ?? true);

  const handler = new SaveMusicTabConfigsHandler(repo as never, quota as never, analytics as never);
  return { handler, repo, quota, analytics };
}

describe('SaveMusicTabConfigsHandler', () => {
  it('does not call quota when not adding new saved configs', async () => {
    const { handler, quota } = setup({ existing: { savedTabConfigs: [savedCfg('s1')] } });

    await handler.execute(
      new SaveMusicTabConfigsCommand(userId(), makePayload({ savedTabConfigs: [savedCfg('s1')] })),
    );

    expect(quota.ensureAllowed).not.toHaveBeenCalled();
  });

  it('gates on search_tab quota with the delta when saved configs grow', async () => {
    const { handler, quota } = setup({ existing: { savedTabConfigs: [savedCfg('s1')] } });

    await handler.execute(
      new SaveMusicTabConfigsCommand(
        userId(),
        makePayload({ savedTabConfigs: [savedCfg('s1'), savedCfg('s2'), savedCfg('s3')] }),
      ),
    );

    expect(quota.ensureAllowed).toHaveBeenCalledWith(userId(), 'search_tab', 2);
  });

  it('treats no existing document as 0 saved configs', async () => {
    const { handler, quota } = setup({ existing: null });

    await handler.execute(
      new SaveMusicTabConfigsCommand(
        userId(),
        makePayload({ savedTabConfigs: [savedCfg('s1'), savedCfg('s2')] }),
      ),
    );

    expect(quota.ensureAllowed).toHaveBeenCalledWith(userId(), 'search_tab', 2);
  });

  it('upserts the doc and emits music_tab_configs_saved on success', async () => {
    const { handler, repo, analytics } = setup();

    const result = await handler.execute(
      new SaveMusicTabConfigsCommand(userId(), makePayload({ savedTabConfigs: [savedCfg('s1')] })),
    );

    expect(result).toBe(true);
    expect(repo.upsert).toHaveBeenCalledWith(
      userId(),
      expect.objectContaining({ user_id: userId(), activeTabId: 't1' }),
    );
    expect(analytics.track).toHaveBeenCalledWith(
      'music_tab_configs_saved',
      userId(),
      expect.objectContaining({ saved_config_count: 1, added_configs: 1 }),
    );
  });

  it('reuses the existing doc id when one is already persisted', async () => {
    const { handler, repo } = setup({
      existing: { id: 'musicTabCfg_existing', savedTabConfigs: [] } as never,
    });

    await handler.execute(new SaveMusicTabConfigsCommand(userId(), makePayload()));

    expect(repo.upsert).toHaveBeenCalledWith(
      userId(),
      expect.objectContaining({ id: 'musicTabCfg_existing' }),
    );
  });

  it('does not emit analytics when upsert returns false', async () => {
    const { handler, analytics } = setup({ upsertOk: false });

    const result = await handler.execute(new SaveMusicTabConfigsCommand(userId(), makePayload()));

    expect(result).toBe(false);
    expect(analytics.track).not.toHaveBeenCalled();
  });
});
