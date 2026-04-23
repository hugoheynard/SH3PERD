import { DeleteTrackCommand, DeleteTrackHandler } from '../DeleteTrackCommand.js';
import {
  makeAggregate,
  makeAnalyzedTrack,
  makeTrack,
  makeVersion,
  trackId,
  userId,
  versionId,
} from '../../../domain/__tests__/test-helpers.js';
import {
  mockAggregateRepo,
  mockAnalytics,
  mockQuotaService,
  mockStorage,
} from './handler-test-helpers.js';
import type { TVersionTrackDomainModel } from '@sh3pherd/shared-types';

function setup(opts: { track?: TVersionTrackDomainModel } = {}) {
  const aggregateRepo = mockAggregateRepo();
  const storage = mockStorage();
  const quota = mockQuotaService();
  const analytics = mockAnalytics();

  const owner = userId();
  const track = opts.track ?? { ...makeAnalyzedTrack(trackId(1)), sizeBytes: 2048 };
  const v = makeVersion({ id: versionId(1), owner_id: owner });
  // Add a second track so the aggregate doesn't block on "cannot delete last track".
  v.addTrack(makeTrack({ id: trackId(2), favorite: false }));
  v.addTrack(track);

  const aggregate = makeAggregate({ owner, versions: [v] });
  aggregateRepo.loadByVersionId.mockResolvedValue(aggregate);
  aggregateRepo.save.mockResolvedValue();

  const handler = new DeleteTrackHandler(
    aggregateRepo,
    storage as never,
    quota as never,
    analytics as never,
  );

  return { handler, aggregateRepo, storage, quota, analytics, owner, track };
}

describe('DeleteTrackHandler', () => {
  it('saves the DB deletion BEFORE touching S3', async () => {
    const { handler, aggregateRepo, storage, owner } = setup();

    const order: string[] = [];
    aggregateRepo.save.mockImplementationOnce(async () => {
      order.push('db.save');
    });
    storage.delete.mockImplementationOnce(async () => {
      order.push('s3.delete');
    });

    await handler.execute(new DeleteTrackCommand(owner, versionId(1), trackId(1)));

    expect(order).toEqual(['db.save', 's3.delete']);
  });

  it('credits back storage_bytes for the removed track', async () => {
    const { handler, quota, owner } = setup();

    await handler.execute(new DeleteTrackCommand(owner, versionId(1), trackId(1)));

    expect(quota.recordUsage).toHaveBeenCalledWith(owner, 'storage_bytes', -2048);
  });

  it('skips storage_bytes credit when the track has no sizeBytes', async () => {
    const { handler, quota, owner } = setup({
      track: makeAnalyzedTrack(trackId(1)),
    });

    await handler.execute(new DeleteTrackCommand(owner, versionId(1), trackId(1)));

    expect(quota.recordUsage).not.toHaveBeenCalled();
  });

  it('swallows S3 failures and still returns success', async () => {
    const { handler, storage, owner } = setup();
    storage.delete.mockRejectedValueOnce(new Error('S3 down'));

    const result = await handler.execute(new DeleteTrackCommand(owner, versionId(1), trackId(1)));

    expect(result).toBe(true);
  });

  it('emits track_deleted analytics with processing metadata', async () => {
    const { handler, analytics, owner, track } = setup();

    await handler.execute(new DeleteTrackCommand(owner, versionId(1), trackId(1)));

    expect(analytics.track).toHaveBeenCalledWith(
      'track_deleted',
      owner,
      expect.objectContaining({
        version_id: versionId(1),
        track_id: trackId(1),
        file_name: track.fileName,
        size_bytes: track.sizeBytes,
      }),
    );
  });

  it('rejects a non-owner before saving or touching S3', async () => {
    const { handler, aggregateRepo, storage } = setup();

    await expect(
      handler.execute(new DeleteTrackCommand(userId(999), versionId(1), trackId(1))),
    ).rejects.toMatchObject({ name: 'DomainError' });

    expect(aggregateRepo.save).not.toHaveBeenCalled();
    expect(storage.delete).not.toHaveBeenCalled();
  });
});
