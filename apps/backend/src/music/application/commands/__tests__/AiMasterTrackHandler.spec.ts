import { of, throwError } from 'rxjs';
import { AiMasterTrackCommand, AiMasterTrackHandler } from '../AiMasterTrackCommand.js';
import { TrackMasteredEvent } from '../../events/TrackMasteredEvent.js';
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
import {
  MicroservicePatterns,
  type TAiMasteringResult,
  type TMasteringTargetSpecs,
} from '@sh3pherd/shared-types';

const loudnormTarget: TMasteringTargetSpecs = { targetLUFS: -14, targetTP: -1, targetLRA: 7 };

const aiResult: TAiMasteringResult = {
  masteredS3Key: 'tracks/o/v/nt/ai_master_test.mp3',
  sizeBytes: 8192,
  predictedParams: {
    eq: [{ type: 'peaking', freq: 2000, gain: 1.5, q: 1.2 }],
    compressor: {
      threshold: -18,
      ratio: 3,
      attack: 0.01,
      release: 0.2,
      knee: 2,
      makeupGain: 1,
    },
  },
};

function setup() {
  const aggregateRepo = mockAggregateRepo();
  const storage = mockStorage();
  const quota = mockQuotaService();
  const analytics = mockAnalytics();
  const audioClient = { send: jest.fn().mockReturnValue(of(aiResult)) };
  const eventBus = { publish: jest.fn() };

  const owner = userId();
  const source = makeAnalyzedTrack(trackId(1));
  const ref = makeAnalyzedTrack(trackId(2));

  const v1 = makeVersion({ id: versionId(1), owner_id: owner });
  v1.addTrack(source);

  const refVersionId = versionId(2);
  const aggregate = makeAggregate({ owner, versions: [v1] });
  const v2 = makeVersion({ id: versionId(2), owner_id: owner });
  v2.addTrack(ref);
  const refAggregate = makeAggregate({ owner, versions: [v2] });

  aggregateRepo.loadByVersionId.mockImplementation(async (id) =>
    id === versionId(1) ? aggregate : refAggregate,
  );
  aggregateRepo.save.mockResolvedValue();

  const handler = new AiMasterTrackHandler(
    aggregateRepo,
    storage as never,
    audioClient as never,
    eventBus as never,
    quota as never,
    analytics as never,
  );

  return {
    handler,
    aggregateRepo,
    storage,
    audioClient,
    eventBus,
    quota,
    analytics,
    owner,
    source,
    ref,
    refVersionId,
  };
}

describe('AiMasterTrackHandler', () => {
  it('gates on master_ai quota before any load', async () => {
    const { handler, aggregateRepo, quota, owner, refVersionId } = setup();

    await handler.execute(
      new AiMasterTrackCommand(owner, versionId(1), trackId(1), refVersionId, trackId(2)),
    );

    expect(quota.ensureAllowed).toHaveBeenCalledWith(owner, 'master_ai');
    expect(aggregateRepo.loadByVersionId).toHaveBeenCalled();
  });

  it('loads the reference from a second aggregate when versions differ', async () => {
    const { handler, aggregateRepo, owner, refVersionId } = setup();

    await handler.execute(
      new AiMasterTrackCommand(owner, versionId(1), trackId(1), refVersionId, trackId(2)),
    );

    expect(aggregateRepo.loadByVersionId).toHaveBeenCalledWith(versionId(1));
    expect(aggregateRepo.loadByVersionId).toHaveBeenCalledWith(versionId(2));
    expect(aggregateRepo.loadByVersionId).toHaveBeenCalledTimes(2);
  });

  it('dispatches payload with source + reference s3 keys and loudnorm target', async () => {
    const { handler, audioClient, owner, source, ref, refVersionId } = setup();

    await handler.execute(
      new AiMasterTrackCommand(
        owner,
        versionId(1),
        trackId(1),
        refVersionId,
        trackId(2),
        loudnormTarget,
      ),
    );

    expect(audioClient.send).toHaveBeenCalledTimes(1);
    const [pattern, payload] = audioClient.send.mock.calls[0];
    expect(pattern).toBe(MicroservicePatterns.AudioProcessor.AI_MASTER_TRACK);
    expect(payload).toMatchObject({
      s3Key: source.s3Key,
      referenceS3Key: ref.s3Key,
      trackId: trackId(1),
      versionId: versionId(1),
      ownerId: owner,
      loudnormTarget,
    });
  });

  it('persists an ai-mastered child track with processingType=ai_master', async () => {
    const { handler, aggregateRepo, owner, source, refVersionId } = setup();

    const result = await handler.execute(
      new AiMasterTrackCommand(owner, versionId(1), trackId(1), refVersionId, trackId(2)),
    );

    expect(aggregateRepo.save).toHaveBeenCalledTimes(1);
    expect(result.parentTrackId).toBe(source.id);
    expect(result.processingType).toBe('ai_master');
    expect(result.favorite).toBe(false);
    expect(result.s3Key).toBe(aiResult.masteredS3Key);
    expect(result.sizeBytes).toBe(aiResult.sizeBytes);
  });

  it('publishes TrackMasteredEvent, records quota, emits track_ai_mastered analytics', async () => {
    const { handler, eventBus, quota, analytics, owner, refVersionId } = setup();

    await handler.execute(
      new AiMasterTrackCommand(
        owner,
        versionId(1),
        trackId(1),
        refVersionId,
        trackId(2),
        loudnormTarget,
      ),
    );

    expect(eventBus.publish).toHaveBeenCalledTimes(1);
    expect(eventBus.publish.mock.calls[0][0]).toBeInstanceOf(TrackMasteredEvent);
    expect(quota.recordUsage).toHaveBeenCalledWith(owner, 'master_ai');
    expect(quota.recordUsage).toHaveBeenCalledWith(owner, 'storage_bytes', aiResult.sizeBytes);
    expect(analytics.track).toHaveBeenCalledWith(
      'track_ai_mastered',
      owner,
      expect.objectContaining({
        version_id: versionId(1),
        track_id: trackId(1),
        reference_track_id: trackId(2),
        target_lufs: loudnormTarget.targetLUFS,
      }),
    );
  });

  it('throws REFERENCE_TRACK_NOT_FOUND (BusinessError) when reference trackId is missing', async () => {
    const { handler, audioClient, owner, refVersionId } = setup();

    await expect(
      handler.execute(
        new AiMasterTrackCommand(owner, versionId(1), trackId(1), refVersionId, trackId(999)),
      ),
    ).rejects.toMatchObject({ name: 'BusinessError', code: 'REFERENCE_TRACK_NOT_FOUND' });

    expect(audioClient.send).not.toHaveBeenCalled();
  });

  it('stops at quota — no load, no send', async () => {
    const { handler, aggregateRepo, audioClient, quota, owner, refVersionId } = setup();
    quota.ensureAllowed.mockRejectedValueOnce(new Error('QUOTA_EXCEEDED'));

    await expect(
      handler.execute(
        new AiMasterTrackCommand(owner, versionId(1), trackId(1), refVersionId, trackId(2)),
      ),
    ).rejects.toThrow('QUOTA_EXCEEDED');

    expect(aggregateRepo.loadByVersionId).not.toHaveBeenCalled();
    expect(audioClient.send).not.toHaveBeenCalled();
  });

  it('compensates the mastered S3 object when the aggregate save fails', async () => {
    const { handler, aggregateRepo, storage, quota, eventBus, owner, refVersionId } = setup();
    aggregateRepo.save.mockRejectedValueOnce(new Error('mongo down'));

    await expect(
      handler.execute(
        new AiMasterTrackCommand(owner, versionId(1), trackId(1), refVersionId, trackId(2)),
      ),
    ).rejects.toThrow('mongo down');

    expect(storage.delete).toHaveBeenCalledWith(aiResult.masteredS3Key);
    expect(quota.recordUsage).not.toHaveBeenCalled();
    expect(eventBus.publish).not.toHaveBeenCalled();
  });

  it('swallows a compensation-delete failure and still surfaces the save error', async () => {
    const { handler, aggregateRepo, storage, owner, refVersionId } = setup();
    aggregateRepo.save.mockRejectedValueOnce(new Error('mongo down'));
    storage.delete.mockRejectedValueOnce(new Error('r2 unreachable'));

    await expect(
      handler.execute(
        new AiMasterTrackCommand(owner, versionId(1), trackId(1), refVersionId, trackId(2)),
      ),
    ).rejects.toThrow('mongo down');

    expect(storage.delete).toHaveBeenCalledTimes(1);
  });

  it('propagates audio-processor failures without mutating DB', async () => {
    const { handler, audioClient, aggregateRepo, quota, eventBus, owner, refVersionId } = setup();
    audioClient.send.mockReturnValueOnce(throwError(() => new Error('AP_DOWN')));

    await expect(
      handler.execute(
        new AiMasterTrackCommand(owner, versionId(1), trackId(1), refVersionId, trackId(2)),
      ),
    ).rejects.toThrow('AP_DOWN');

    expect(aggregateRepo.save).not.toHaveBeenCalled();
    expect(quota.recordUsage).not.toHaveBeenCalled();
    expect(eventBus.publish).not.toHaveBeenCalled();
  });
});
