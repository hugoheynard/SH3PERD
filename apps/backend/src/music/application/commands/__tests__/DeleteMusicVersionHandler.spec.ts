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
} from './handler-test-helpers.js';
import type { TVersionTrackDomainModel } from '@sh3pherd/shared-types';

function analysedTrackWithSize(
  id: ReturnType<typeof trackId>,
  bytes: number,
): TVersionTrackDomainModel {
  return { ...makeAnalyzedTrack(id), sizeBytes: bytes };
}

function setup(opts: { tracks?: TVersionTrackDomainModel[] } = {}) {
  const aggregateRepo = mockAggregateRepo();
  const storage = mockStorage();
  const quota = mockQuotaService();
  const analytics = mockAnalytics();

  const owner = userId();
  const v = makeVersion({ id: versionId(1), owner_id: owner });
  const tracks = opts.tracks ?? [];
  for (const t of tracks) v.addTrack(t);

  const aggregate = makeAggregate({ owner, versions: [v] });
  aggregateRepo.loadByVersionId.mockResolvedValue(aggregate);
  aggregateRepo.save.mockResolvedValue();

  const handler = new DeleteMusicVersionHandler(
    aggregateRepo,
    storage as never,
    quota as never,
    analytics as never,
  );

  return { handler, aggregateRepo, storage, quota, analytics, owner, tracks };
}

describe('DeleteMusicVersionHandler', () => {
  it('saves the DB deletion BEFORE touching S3 (DB is source of truth)', async () => {
    const { handler, aggregateRepo, storage, owner } = setup({
      tracks: [analysedTrackWithSize(trackId(1), 1024)],
    });

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

  it('parallelizes S3 deletes (Promise.all) and swallows failures with a warn log', async () => {
    const { handler, storage, owner } = setup({
      tracks: [analysedTrackWithSize(trackId(1), 1000), analysedTrackWithSize(trackId(2), 2000)],
    });
    storage.delete.mockRejectedValueOnce(new Error('S3 transient'));
    storage.delete.mockResolvedValueOnce(undefined);

    const result = await handler.execute(new DeleteMusicVersionCommand(owner, versionId(1)));

    expect(result).toBe(true);
    expect(storage.delete).toHaveBeenCalledTimes(2);
  });

  it('credits back storage_bytes summed across all removed tracks', async () => {
    const { handler, quota, owner } = setup({
      tracks: [analysedTrackWithSize(trackId(1), 1500), analysedTrackWithSize(trackId(2), 3500)],
    });

    await handler.execute(new DeleteMusicVersionCommand(owner, versionId(1)));

    expect(quota.recordUsage).toHaveBeenCalledWith(owner, 'storage_bytes', -5000);
  });

  it('skips storage_bytes restitution when no track has sizeBytes', async () => {
    const { handler, quota, owner } = setup({ tracks: [makeAnalyzedTrack(trackId(1))] });

    await handler.execute(new DeleteMusicVersionCommand(owner, versionId(1)));

    expect(quota.recordUsage).not.toHaveBeenCalled();
  });

  it('emits music_version_deleted with track / derivation / bytes counts', async () => {
    const { handler, analytics, owner } = setup({
      tracks: [analysedTrackWithSize(trackId(1), 500), analysedTrackWithSize(trackId(2), 700)],
    });

    await handler.execute(new DeleteMusicVersionCommand(owner, versionId(1)));

    expect(analytics.track).toHaveBeenCalledWith(
      'music_version_deleted',
      owner,
      expect.objectContaining({
        version_id: versionId(1),
        track_count: 2,
        derivation_count: 0,
        total_size_bytes: 1200,
      }),
    );
  });

  it('rejects a non-owner with DomainError MUSIC_VERSION_NOT_OWNED — no save, no S3', async () => {
    const { handler, aggregateRepo, storage } = setup({
      tracks: [analysedTrackWithSize(trackId(1), 100)],
    });

    await expect(
      handler.execute(new DeleteMusicVersionCommand(userId(999), versionId(1))),
    ).rejects.toMatchObject({
      name: 'DomainError',
      code: 'MUSIC_VERSION_NOT_OWNED',
    });

    expect(aggregateRepo.save).not.toHaveBeenCalled();
    expect(storage.delete).not.toHaveBeenCalled();
  });

  it('skips post-save side effects when persistence fails', async () => {
    const { handler, aggregateRepo, storage, quota, analytics, owner } = setup({
      tracks: [analysedTrackWithSize(trackId(1), 100)],
    });
    aggregateRepo.save.mockRejectedValueOnce(new Error('mongo down'));

    await expect(
      handler.execute(new DeleteMusicVersionCommand(owner, versionId(1))),
    ).rejects.toThrow('mongo down');

    expect(storage.delete).not.toHaveBeenCalled();
    expect(quota.recordUsage).not.toHaveBeenCalled();
    expect(analytics.track).not.toHaveBeenCalled();
  });
});
