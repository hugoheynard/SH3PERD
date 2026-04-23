import { UploadTrackCommand, UploadTrackHandler } from '../UploadTrackCommand.js';
import { TrackUploadedEvent } from '../../events/TrackUploadedEvent.js';
import {
  makeAggregate,
  makeTrack,
  makeVersion,
  userId,
  versionId,
} from '../../../domain/__tests__/test-helpers.js';
import {
  mockAggregateRepo,
  mockAnalytics,
  mockQuotaService,
  mockStorage,
} from './handler-test-helpers.js';
import type { TUploadTrackPayload } from '@sh3pherd/shared-types';

const payload: TUploadTrackPayload = {
  fileName: 'song.mp3',
  durationSeconds: 180,
};

const file = Buffer.alloc(2048, 0);
const contentType = 'audio/mpeg';

function setup(opts: { existingTrackCount?: number } = {}) {
  const aggregateRepo = mockAggregateRepo();
  const storage = mockStorage();
  const quota = mockQuotaService();
  const analytics = mockAnalytics();
  const eventBus = { publish: jest.fn() };

  const owner = userId();
  const v = makeVersion({ id: versionId(1), owner_id: owner });
  for (let i = 0; i < (opts.existingTrackCount ?? 0); i++) v.addTrack(makeTrack());

  const aggregate = makeAggregate({ owner, versions: [v] });
  aggregateRepo.loadByVersionId.mockResolvedValue(aggregate);
  aggregateRepo.save.mockResolvedValue();

  const handler = new UploadTrackHandler(
    aggregateRepo,
    storage as never,
    eventBus as never,
    quota as never,
    analytics as never,
  );

  return { handler, aggregateRepo, storage, quota, analytics, eventBus, owner };
}

describe('UploadTrackHandler', () => {
  it('gates on both track_upload and storage_bytes quotas before loading', async () => {
    const { handler, aggregateRepo, quota, owner } = setup();

    await handler.execute(new UploadTrackCommand(owner, versionId(1), file, contentType, payload));

    expect(quota.ensureAllowed).toHaveBeenNthCalledWith(1, owner, 'track_upload');
    expect(quota.ensureAllowed).toHaveBeenNthCalledWith(2, owner, 'storage_bytes', file.length);
    expect(aggregateRepo.loadByVersionId).toHaveBeenCalledWith(versionId(1));
  });

  it('uploads to S3 before saving the aggregate (S3 first, DB second)', async () => {
    const { handler, aggregateRepo, storage, owner } = setup();

    const callOrder: string[] = [];
    storage.upload.mockImplementationOnce(async () => {
      callOrder.push('s3.upload');
    });
    aggregateRepo.save.mockImplementationOnce(async () => {
      callOrder.push('db.save');
    });

    await handler.execute(new UploadTrackCommand(owner, versionId(1), file, contentType, payload));

    expect(callOrder).toEqual(['s3.upload', 'db.save']);
  });

  it('marks the first track as favorite and subsequent ones as non-favorite', async () => {
    const first = setup();
    const r1 = await first.handler.execute(
      new UploadTrackCommand(first.owner, versionId(1), file, contentType, payload),
    );
    expect(r1.favorite).toBe(true);

    const next = setup({ existingTrackCount: 1 });
    const r2 = await next.handler.execute(
      new UploadTrackCommand(next.owner, versionId(1), file, contentType, payload),
    );
    expect(r2.favorite).toBe(false);
  });

  it('records usage for both keys after a successful save', async () => {
    const { handler, quota, owner } = setup();

    await handler.execute(new UploadTrackCommand(owner, versionId(1), file, contentType, payload));

    expect(quota.recordUsage).toHaveBeenCalledWith(owner, 'track_upload');
    expect(quota.recordUsage).toHaveBeenCalledWith(owner, 'storage_bytes', file.length);
  });

  it('publishes TrackUploadedEvent carrying the new track id and s3 key', async () => {
    const { handler, eventBus, owner } = setup();

    const track = await handler.execute(
      new UploadTrackCommand(owner, versionId(1), file, contentType, payload),
    );

    expect(eventBus.publish).toHaveBeenCalledTimes(1);
    const event = eventBus.publish.mock.calls[0][0] as TrackUploadedEvent;
    expect(event).toBeInstanceOf(TrackUploadedEvent);
    expect(event.ownerId).toBe(owner);
    expect(event.versionId).toBe(versionId(1));
    expect(event.trackId).toBe(track.id);
    expect(event.s3Key).toBe(track.s3Key);
  });

  it('emits track_uploaded analytics with file metadata', async () => {
    const { handler, analytics, owner } = setup();

    const track = await handler.execute(
      new UploadTrackCommand(owner, versionId(1), file, contentType, payload),
    );

    expect(analytics.track).toHaveBeenCalledWith(
      'track_uploaded',
      owner,
      expect.objectContaining({
        version_id: versionId(1),
        track_id: track.id,
        file_name: payload.fileName,
        file_size_bytes: file.length,
        duration_seconds: payload.durationSeconds,
        format: contentType,
      }),
    );
  });

  it('stops at quota check — no load, no upload, no save', async () => {
    const { handler, aggregateRepo, storage, quota, analytics, owner } = setup();
    quota.ensureAllowed.mockRejectedValueOnce(new Error('QUOTA_EXCEEDED'));

    await expect(
      handler.execute(new UploadTrackCommand(owner, versionId(1), file, contentType, payload)),
    ).rejects.toThrow('QUOTA_EXCEEDED');

    expect(aggregateRepo.loadByVersionId).not.toHaveBeenCalled();
    expect(storage.upload).not.toHaveBeenCalled();
    expect(aggregateRepo.save).not.toHaveBeenCalled();
    expect(quota.recordUsage).not.toHaveBeenCalled();
    expect(analytics.track).not.toHaveBeenCalled();
  });

  it('rejects a non-owner before any S3 upload', async () => {
    const { handler, storage, aggregateRepo } = setup();

    await expect(
      handler.execute(
        new UploadTrackCommand(userId(999), versionId(1), file, contentType, payload),
      ),
    ).rejects.toMatchObject({ name: 'DomainError' });

    expect(storage.upload).not.toHaveBeenCalled();
    expect(aggregateRepo.save).not.toHaveBeenCalled();
  });

  it('compensates the S3 object when the aggregate save fails', async () => {
    const { handler, aggregateRepo, storage, quota, analytics, eventBus, owner } = setup();
    aggregateRepo.save.mockRejectedValueOnce(new Error('mongo down'));

    await expect(
      handler.execute(new UploadTrackCommand(owner, versionId(1), file, contentType, payload)),
    ).rejects.toThrow('mongo down');

    expect(storage.upload).toHaveBeenCalledTimes(1);
    expect(storage.delete).toHaveBeenCalledTimes(1);
    const uploadedKey = storage.upload.mock.calls[0][0];
    const deletedKey = storage.delete.mock.calls[0][0];
    expect(deletedKey).toBe(uploadedKey);

    expect(quota.recordUsage).not.toHaveBeenCalled();
    expect(eventBus.publish).not.toHaveBeenCalled();
    expect(analytics.track).not.toHaveBeenCalled();
  });

  it('swallows S3 compensation errors and still surfaces the original save failure', async () => {
    const { handler, aggregateRepo, storage, owner } = setup();
    aggregateRepo.save.mockRejectedValueOnce(new Error('mongo down'));
    storage.delete.mockRejectedValueOnce(new Error('s3 unreachable'));

    await expect(
      handler.execute(new UploadTrackCommand(owner, versionId(1), file, contentType, payload)),
    ).rejects.toThrow('mongo down');
  });
});
