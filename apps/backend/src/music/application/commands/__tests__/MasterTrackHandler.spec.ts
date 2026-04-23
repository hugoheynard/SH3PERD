import { of, throwError } from 'rxjs';
import { MasterTrackCommand, MasterTrackHandler } from '../MasterTrackCommand.js';
import { TrackMasteredEvent } from '../../events/TrackMasteredEvent.js';
import {
  makeAggregate,
  makeAnalyzedTrack,
  makeVersion,
  trackId,
  userId,
  versionId,
} from '../../../domain/__tests__/test-helpers.js';
import { mockAggregateRepo, mockAnalytics, mockQuotaService } from './handler-test-helpers.js';
import {
  MicroservicePatterns,
  type TMasteringResult,
  type TMasteringTargetSpecs,
} from '@sh3pherd/shared-types';

const target: TMasteringTargetSpecs = { targetLUFS: -14, targetTP: -1, targetLRA: 7 };

const masteringResult: TMasteringResult = {
  masteredS3Key: 'tracks/owner/ver/new-track/master_song.mp3',
  sizeBytes: 4096,
  report: '',
};

function setup() {
  const aggregateRepo = mockAggregateRepo();
  const quota = mockQuotaService();
  const analytics = mockAnalytics();
  const audioClient = { send: jest.fn().mockReturnValue(of(masteringResult)) };
  const eventBus = { publish: jest.fn() };

  const owner = userId();
  const source = makeAnalyzedTrack(trackId(1));
  const v = makeVersion({ id: versionId(1), owner_id: owner });
  v.addTrack(source);

  const aggregate = makeAggregate({ owner, versions: [v] });
  aggregateRepo.loadByVersionId.mockResolvedValue(aggregate);
  aggregateRepo.save.mockResolvedValue();

  const handler = new MasterTrackHandler(
    aggregateRepo,
    audioClient as never,
    eventBus as never,
    quota as never,
    analytics as never,
  );

  return { handler, aggregateRepo, audioClient, eventBus, quota, analytics, owner, source };
}

describe('MasterTrackHandler', () => {
  it('gates on master_standard quota before loading the aggregate', async () => {
    const { handler, aggregateRepo, quota, owner } = setup();

    await handler.execute(new MasterTrackCommand(owner, versionId(1), trackId(1), target));

    expect(quota.ensureAllowed).toHaveBeenCalledWith(owner, 'master_standard');
    expect(aggregateRepo.loadByVersionId).toHaveBeenCalledWith(versionId(1));
  });

  it('dispatches to audio-processor with source s3Key, measured loudness, and target', async () => {
    const { handler, audioClient, owner, source } = setup();

    await handler.execute(new MasterTrackCommand(owner, versionId(1), trackId(1), target));

    expect(audioClient.send).toHaveBeenCalledTimes(1);
    const [pattern, payload] = audioClient.send.mock.calls[0];
    expect(pattern).toBe(MicroservicePatterns.AudioProcessor.MASTER_TRACK);
    expect(payload).toMatchObject({
      s3Key: source.s3Key,
      trackId: trackId(1),
      versionId: versionId(1),
      ownerId: owner,
      measured: {
        integratedLUFS: source.analysisResult!.integratedLUFS,
        truePeakdBTP: source.analysisResult!.truePeakdBTP,
        loudnessRange: source.analysisResult!.loudnessRange,
      },
      target,
    });
  });

  it('persists a mastered child track with parentTrackId + processingType=master', async () => {
    const { handler, aggregateRepo, owner, source } = setup();

    const result = await handler.execute(
      new MasterTrackCommand(owner, versionId(1), trackId(1), target),
    );

    expect(aggregateRepo.save).toHaveBeenCalledTimes(1);
    expect(result.parentTrackId).toBe(source.id);
    expect(result.processingType).toBe('master');
    expect(result.favorite).toBe(false);
    expect(result.s3Key).toBe(masteringResult.masteredS3Key);
    expect(result.sizeBytes).toBe(masteringResult.sizeBytes);
  });

  it('publishes TrackMasteredEvent after save, then records quota + analytics', async () => {
    const { handler, eventBus, quota, analytics, owner } = setup();

    const result = await handler.execute(
      new MasterTrackCommand(owner, versionId(1), trackId(1), target),
    );

    expect(eventBus.publish).toHaveBeenCalledTimes(1);
    const event = eventBus.publish.mock.calls[0][0] as TrackMasteredEvent;
    expect(event).toBeInstanceOf(TrackMasteredEvent);
    expect(event.trackId).toBe(result.id);
    expect(event.s3Key).toBe(masteringResult.masteredS3Key);

    expect(quota.recordUsage).toHaveBeenCalledWith(owner, 'master_standard');
    expect(analytics.track).toHaveBeenCalledWith(
      'track_mastered',
      owner,
      expect.objectContaining({
        version_id: versionId(1),
        track_id: trackId(1),
        target_lufs: target.targetLUFS,
        target_tp: target.targetTP,
      }),
    );
  });

  it('stops at quota — no load, no send, no save', async () => {
    const { handler, aggregateRepo, audioClient, quota, owner } = setup();
    quota.ensureAllowed.mockRejectedValueOnce(new Error('QUOTA_EXCEEDED'));

    await expect(
      handler.execute(new MasterTrackCommand(owner, versionId(1), trackId(1), target)),
    ).rejects.toThrow('QUOTA_EXCEEDED');

    expect(aggregateRepo.loadByVersionId).not.toHaveBeenCalled();
    expect(audioClient.send).not.toHaveBeenCalled();
    expect(aggregateRepo.save).not.toHaveBeenCalled();
    expect(quota.recordUsage).not.toHaveBeenCalled();
  });

  it('rejects a non-owner before dispatching to the microservice', async () => {
    const { handler, aggregateRepo, audioClient } = setup();

    await expect(
      handler.execute(new MasterTrackCommand(userId(999), versionId(1), trackId(1), target)),
    ).rejects.toMatchObject({ name: 'DomainError' });

    expect(audioClient.send).not.toHaveBeenCalled();
    expect(aggregateRepo.save).not.toHaveBeenCalled();
  });

  it('propagates audio-processor failures without mutating DB or quota', async () => {
    const { handler, audioClient, aggregateRepo, quota, analytics, eventBus, owner } = setup();
    audioClient.send.mockReturnValueOnce(throwError(() => new Error('AP_DOWN')));

    await expect(
      handler.execute(new MasterTrackCommand(owner, versionId(1), trackId(1), target)),
    ).rejects.toThrow('AP_DOWN');

    expect(aggregateRepo.save).not.toHaveBeenCalled();
    expect(quota.recordUsage).not.toHaveBeenCalled();
    expect(eventBus.publish).not.toHaveBeenCalled();
    expect(analytics.track).not.toHaveBeenCalled();
  });
});
