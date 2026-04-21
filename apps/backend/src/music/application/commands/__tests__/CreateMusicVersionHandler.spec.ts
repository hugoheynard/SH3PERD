import {
  CreateMusicVersionCommand,
  CreateMusicVersionHandler,
} from '../CreateMusicVersionCommand.js';
import {
  makeAggregate,
  refId,
  userId,
  GENRE,
  VERSION_TYPE,
} from '../../../domain/__tests__/test-helpers.js';
import { mockAggregateRepo, mockAnalytics, mockQuotaService } from './handler-test-helpers.js';
import type { TMusicRating, TCreateMusicVersionPayload } from '@sh3pherd/shared-types';

const basePayload: TCreateMusicVersionPayload = {
  musicReference_id: refId(),
  label: 'Acoustic',
  genre: GENRE.Pop,
  type: VERSION_TYPE.Cover,
  bpm: 120,
  pitch: null,
  mastery: 3 as TMusicRating,
  energy: 3 as TMusicRating,
  effort: 2 as TMusicRating,
};

function setup() {
  const aggregateRepo = mockAggregateRepo();
  const quota = mockQuotaService();
  const analytics = mockAnalytics();

  const handler = new CreateMusicVersionHandler(aggregateRepo, quota as never, analytics as never);

  const aggregate = makeAggregate({ owner: userId() });
  aggregateRepo.loadByOwnerAndReference.mockResolvedValue(aggregate);
  aggregateRepo.save.mockResolvedValue();

  return { handler, aggregateRepo, quota, analytics, aggregate };
}

describe('CreateMusicVersionHandler', () => {
  it('gates on quota before loading the aggregate', async () => {
    const { handler, aggregateRepo, quota } = setup();

    await handler.execute(new CreateMusicVersionCommand(userId(), basePayload));

    expect(quota.ensureAllowed).toHaveBeenCalledWith(userId(), 'track_version');
    expect(aggregateRepo.loadByOwnerAndReference).toHaveBeenCalledWith(userId(), refId());
  });

  it('persists the new version and records quota on success', async () => {
    const { handler, aggregateRepo, quota } = setup();

    const result = await handler.execute(new CreateMusicVersionCommand(userId(), basePayload));

    expect(aggregateRepo.save).toHaveBeenCalledTimes(1);
    expect(quota.recordUsage).toHaveBeenCalledWith(userId(), 'track_version');
    expect(result.label).toBe('Acoustic');
    expect(result.owner_id).toBe(userId());
    expect(result.musicReference_id).toBe(refId());
  });

  it('emits music_version_created analytics with reference + type + genre', async () => {
    const { handler, analytics } = setup();

    await handler.execute(new CreateMusicVersionCommand(userId(), basePayload));

    expect(analytics.track).toHaveBeenCalledWith(
      'music_version_created',
      userId(),
      expect.objectContaining({
        reference_id: refId(),
        label: 'Acoustic',
        type: VERSION_TYPE.Cover,
        genre: GENRE.Pop,
      }),
    );
  });

  it('stops at quota check — no load, no save, no analytics', async () => {
    const { handler, aggregateRepo, quota, analytics } = setup();
    quota.ensureAllowed.mockRejectedValueOnce(new Error('QUOTA_EXCEEDED'));

    await expect(
      handler.execute(new CreateMusicVersionCommand(userId(), basePayload)),
    ).rejects.toThrow('QUOTA_EXCEEDED');

    expect(aggregateRepo.loadByOwnerAndReference).not.toHaveBeenCalled();
    expect(aggregateRepo.save).not.toHaveBeenCalled();
    expect(quota.recordUsage).not.toHaveBeenCalled();
    expect(analytics.track).not.toHaveBeenCalled();
  });

  it('does not save when entity invariants reject the payload', async () => {
    const { handler, aggregateRepo } = setup();

    await expect(
      handler.execute(new CreateMusicVersionCommand(userId(), { ...basePayload, label: '   ' })),
    ).rejects.toThrow('MUSIC_VERSION_LABEL_REQUIRED');

    expect(aggregateRepo.save).not.toHaveBeenCalled();
  });
});
