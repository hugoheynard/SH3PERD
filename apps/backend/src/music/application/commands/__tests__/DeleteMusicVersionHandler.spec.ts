import {
  DeleteMusicVersionCommand,
  DeleteMusicVersionHandler,
} from '../DeleteMusicVersionCommand.js';
import {
  makeAggregate,
  makeAnalyzedTrack,
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
  mockTransactionRunner,
} from './handler-test-helpers.js';
import { TechnicalError } from '../../../../utils/errorManagement/TechnicalError.js';

function setup(opts: { numTracks?: number } = {}) {
  const aggregateRepo = mockAggregateRepo();
  const storage = mockStorage();
  const quota = mockQuotaService();
  const analytics = mockAnalytics();
  const tx = mockTransactionRunner();

  const owner = userId();
  const v = makeVersion({ id: versionId(1), owner_id: owner });
  for (let i = 1; i <= (opts.numTracks ?? 0); i++) {
    v.addTrack(makeAnalyzedTrack(trackId(i)));
  }

  const aggregate = makeAggregate({ owner, versions: [v] });
  aggregateRepo.loadByVersionId.mockResolvedValue(aggregate);
  aggregateRepo.save.mockResolvedValue();

  const handler = new DeleteMusicVersionHandler(
    aggregateRepo,
    storage as never,
    quota as never,
    analytics as never,
    tx as never,
  );

  return { handler, aggregateRepo, storage, quota, analytics, tx, owner, version: v };
}

describe('DeleteMusicVersionHandler', () => {
  it('saves the deletion in a transaction BEFORE touching S3 (DB is source of truth)', async () => {
    const { handler, aggregateRepo, storage, owner } = setup({ numTracks: 1 });

    const callOrder: string[] = [];
    aggregateRepo.save.mockImplementationOnce(async () => {
      callOrder.push('db.save');
    });
    storage.delete.mockImplementationOnce(async () => {
      callOrder.push('s3.delete');
    });

    await handler.execute(new DeleteMusicVersionCommand(owner, versionId(1)));

    expect(callOrder).toEqual(['db.save', 's3.delete']);
  });

  it('decrements the track_version quota by 1 after a successful save', async () => {
    const { handler, quota, owner } = setup({ numTracks: 0 });

    await handler.execute(new DeleteMusicVersionCommand(owner, versionId(1)));

    expect(quota.recordUsage).toHaveBeenCalledWith(owner, 'track_version', -1);
  });

  it('emits music_version_deleted with num_tracks in metadata', async () => {
    const { handler, analytics, owner } = setup({ numTracks: 2 });

    await handler.execute(new DeleteMusicVersionCommand(owner, versionId(1)));

    expect(analytics.track).toHaveBeenCalledWith('music_version_deleted', owner, {
      version_id: versionId(1),
      num_tracks: 2,
    });
  });

  it('parallelizes S3 deletes (Promise.all) and swallows storage failures with a warn log', async () => {
    const { handler, storage, owner } = setup({ numTracks: 2 });
    storage.delete.mockRejectedValueOnce(new Error('S3 down')); // first track
    storage.delete.mockResolvedValueOnce(undefined); // second track

    const result = await handler.execute(new DeleteMusicVersionCommand(owner, versionId(1)));

    expect(result).toBe(true);
    expect(storage.delete).toHaveBeenCalledTimes(2);
  });

  it('rejects with MUSIC_VERSION_NOT_OWNED when actor differs from owner — no S3, no save', async () => {
    const { handler, aggregateRepo, storage } = setup({ numTracks: 1 });

    await expect(
      handler.execute(new DeleteMusicVersionCommand(userId(999), versionId(1))),
    ).rejects.toMatchObject({
      name: 'BusinessError',
      code: 'MUSIC_VERSION_NOT_OWNED',
      status: 403,
    });

    expect(aggregateRepo.save).not.toHaveBeenCalled();
    expect(storage.delete).not.toHaveBeenCalled();
  });

  it('wraps unknown persistence errors in a TechnicalError with numTracks context', async () => {
    const { handler, aggregateRepo, owner, storage, analytics, quota } = setup({ numTracks: 1 });
    aggregateRepo.save.mockRejectedValueOnce(new Error('mongo down'));

    await expect(
      handler.execute(new DeleteMusicVersionCommand(owner, versionId(1))),
    ).rejects.toMatchObject({
      name: 'TechnicalError',
      code: 'MUSIC_VERSION_DELETE_REPO_FAIL',
      context: expect.objectContaining({
        actorId: owner,
        versionId: versionId(1),
        numTracks: 1,
        operation: 'DeleteMusicVersion.save',
      }),
    });

    // Side effects must NOT run when persistence fails
    expect(storage.delete).not.toHaveBeenCalled();
    expect(quota.recordUsage).not.toHaveBeenCalled();
    expect(analytics.track).not.toHaveBeenCalled();
  });

  it('wraps any runner failure (even a TechnicalError) with handler context', async () => {
    const { handler, aggregateRepo, owner } = setup({ numTracks: 0 });
    const inner = new TechnicalError('Transaction failed', { code: 'TRANSACTION_FAILED' });
    aggregateRepo.save.mockRejectedValueOnce(inner);

    await expect(
      handler.execute(new DeleteMusicVersionCommand(owner, versionId(1))),
    ).rejects.toMatchObject({
      name: 'TechnicalError',
      code: 'MUSIC_VERSION_DELETE_REPO_FAIL',
      cause: inner,
    });
  });

  it('throws MUSIC_VERSION_NOT_FOUND (404) when the aggregate is missing', async () => {
    const { handler, aggregateRepo, owner } = setup({ numTracks: 0 });
    aggregateRepo.loadByVersionId.mockResolvedValueOnce(null);

    await expect(
      handler.execute(new DeleteMusicVersionCommand(owner, versionId(1))),
    ).rejects.toMatchObject({
      name: 'BusinessError',
      code: 'MUSIC_VERSION_NOT_FOUND',
      status: 404,
    });

    expect(aggregateRepo.save).not.toHaveBeenCalled();
  });
});
