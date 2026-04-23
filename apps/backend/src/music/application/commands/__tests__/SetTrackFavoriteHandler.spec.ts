import { SetTrackFavoriteCommand, SetTrackFavoriteHandler } from '../SetTrackFavoriteCommand.js';
import {
  makeAggregate,
  makeTrack,
  makeVersion,
  trackId,
  userId,
  versionId,
} from '../../../domain/__tests__/test-helpers.js';
import { mockAggregateRepo, mockAnalytics } from './handler-test-helpers.js';

function setup() {
  const aggregateRepo = mockAggregateRepo();
  const analytics = mockAnalytics();

  const owner = userId();
  const v = makeVersion({ id: versionId(1), owner_id: owner });
  v.addTrack(makeTrack({ id: trackId(1), favorite: true }));
  v.addTrack(makeTrack({ id: trackId(2), favorite: false }));

  const aggregate = makeAggregate({ owner, versions: [v] });
  aggregateRepo.loadByVersionId.mockResolvedValue(aggregate);
  aggregateRepo.save.mockResolvedValue();

  const handler = new SetTrackFavoriteHandler(aggregateRepo, analytics as never);
  return { handler, aggregateRepo, analytics, owner, aggregate };
}

describe('SetTrackFavoriteHandler', () => {
  it('toggles favorite on the target track and persists the aggregate', async () => {
    const { handler, aggregateRepo, aggregate, owner } = setup();

    await handler.execute(new SetTrackFavoriteCommand(owner, versionId(1), trackId(2)));

    const v = aggregate.findVersion(versionId(1))!;
    expect(v.findTrack(trackId(2))!.favorite).toBe(true);
    expect(v.findTrack(trackId(1))!.favorite).toBe(false);
    expect(aggregateRepo.save).toHaveBeenCalledTimes(1);
  });

  it('emits track_favorited analytics with version + track ids', async () => {
    const { handler, analytics, owner } = setup();

    await handler.execute(new SetTrackFavoriteCommand(owner, versionId(1), trackId(2)));

    expect(analytics.track).toHaveBeenCalledWith(
      'track_favorited',
      owner,
      expect.objectContaining({ version_id: versionId(1), track_id: trackId(2) }),
    );
  });

  it('rejects a non-owner before saving', async () => {
    const { handler, aggregateRepo } = setup();

    await expect(
      handler.execute(new SetTrackFavoriteCommand(userId(999), versionId(1), trackId(2))),
    ).rejects.toMatchObject({ name: 'DomainError' });

    expect(aggregateRepo.save).not.toHaveBeenCalled();
  });
});
