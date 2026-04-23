import { of, throwError } from 'rxjs';
import { PitchShiftVersionCommand, PitchShiftVersionHandler } from '../PitchShiftVersionCommand.js';
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
import { MicroservicePatterns, type TPitchShiftResult } from '@sh3pherd/shared-types';

const pitchResult: TPitchShiftResult = {
  shiftedS3Key: 'tracks/o/v/nt/pitched_test.mp3',
  sizeBytes: 5120,
};

function setup(opts: { sourcePitch?: number | null } = {}) {
  const aggregateRepo = mockAggregateRepo();
  const storage = mockStorage();
  const quota = mockQuotaService();
  const analytics = mockAnalytics();
  const audioClient = { send: jest.fn().mockReturnValue(of(pitchResult)) };

  const owner = userId();
  const source = makeAnalyzedTrack(trackId(1));
  const v = makeVersion({
    id: versionId(1),
    owner_id: owner,
    label: 'Acoustic',
    pitch: opts.sourcePitch ?? null,
  });
  v.addTrack(source);

  const aggregate = makeAggregate({ owner, versions: [v] });
  aggregateRepo.loadByVersionId.mockResolvedValue(aggregate);
  aggregateRepo.save.mockResolvedValue();

  const handler = new PitchShiftVersionHandler(
    aggregateRepo,
    storage as never,
    audioClient as never,
    quota as never,
    analytics as never,
  );

  return {
    handler,
    aggregateRepo,
    storage,
    audioClient,
    quota,
    analytics,
    owner,
    source,
    aggregate,
  };
}

describe('PitchShiftVersionHandler', () => {
  it('gates on pitch_shift quota before loading', async () => {
    const { handler, aggregateRepo, quota, owner } = setup();

    await handler.execute(new PitchShiftVersionCommand(owner, versionId(1), trackId(1), 2));

    expect(quota.ensureAllowed).toHaveBeenCalledWith(owner, 'pitch_shift');
    expect(aggregateRepo.loadByVersionId).toHaveBeenCalledWith(versionId(1));
  });

  it('dispatches to audio-processor with source key, output key and semitone count', async () => {
    const { handler, audioClient, owner, source } = setup();

    await handler.execute(new PitchShiftVersionCommand(owner, versionId(1), trackId(1), 3));

    expect(audioClient.send).toHaveBeenCalledTimes(1);
    const [pattern, payload] = audioClient.send.mock.calls[0];
    expect(pattern).toBe(MicroservicePatterns.AudioProcessor.PITCH_SHIFT_TRACK);
    expect(payload).toMatchObject({
      s3Key: source.s3Key,
      trackId: trackId(1),
      versionId: versionId(1),
      ownerId: owner,
      semitones: 3,
    });
  });

  it('creates a derived version labelled with the pitch offset (+N / -N)', async () => {
    const up = await setup().handler.execute(
      new PitchShiftVersionCommand(userId(), versionId(1), trackId(1), 2),
    );
    expect(up.label).toBe('Acoustic (+2st)');
    expect(up.derivationType).toBe('pitch_shift');
    expect(up.parentVersionId).toBe(versionId(1));

    const down = await setup().handler.execute(
      new PitchShiftVersionCommand(userId(), versionId(1), trackId(1), -3),
    );
    expect(down.label).toBe('Acoustic (-3st)');
  });

  it('adds semitones to the source pitch (null → semitones)', async () => {
    const fromNull = await setup({ sourcePitch: null }).handler.execute(
      new PitchShiftVersionCommand(userId(), versionId(1), trackId(1), 4),
    );
    expect(fromNull.pitch).toBe(4);

    const fromThree = await setup({ sourcePitch: 3 }).handler.execute(
      new PitchShiftVersionCommand(userId(), versionId(1), trackId(1), -1),
    );
    expect(fromThree.pitch).toBe(2);
  });

  it('marks the new track as favorite and links it to the source track', async () => {
    const { handler, owner, source } = setup();

    const result = await handler.execute(
      new PitchShiftVersionCommand(owner, versionId(1), trackId(1), 2),
    );

    expect(result.tracks).toHaveLength(1);
    const newTrack = result.tracks[0];
    expect(newTrack.favorite).toBe(true);
    expect(newTrack.parentTrackId).toBe(source.id);
    expect(newTrack.s3Key).toBe(pitchResult.shiftedS3Key);
  });

  it('persists the derived version, records quota, emits track_pitch_shifted analytics', async () => {
    const { handler, aggregateRepo, quota, analytics, owner } = setup({ sourcePitch: 1 });

    await handler.execute(new PitchShiftVersionCommand(owner, versionId(1), trackId(1), 2));

    expect(aggregateRepo.save).toHaveBeenCalledTimes(1);
    expect(quota.recordUsage).toHaveBeenCalledWith(owner, 'pitch_shift');
    expect(quota.recordUsage).toHaveBeenCalledWith(owner, 'storage_bytes', pitchResult.sizeBytes);
    expect(analytics.track).toHaveBeenCalledWith(
      'track_pitch_shifted',
      owner,
      expect.objectContaining({
        version_id: versionId(1),
        track_id: trackId(1),
        semitones: 2,
        original_key: 1,
      }),
    );
  });

  it('stops at quota — no load, no send, no save', async () => {
    const { handler, aggregateRepo, audioClient, quota, owner } = setup();
    quota.ensureAllowed.mockRejectedValueOnce(new Error('QUOTA_EXCEEDED'));

    await expect(
      handler.execute(new PitchShiftVersionCommand(owner, versionId(1), trackId(1), 2)),
    ).rejects.toThrow('QUOTA_EXCEEDED');

    expect(aggregateRepo.loadByVersionId).not.toHaveBeenCalled();
    expect(audioClient.send).not.toHaveBeenCalled();
    expect(aggregateRepo.save).not.toHaveBeenCalled();
  });

  it('compensates the shifted S3 object when the aggregate save fails', async () => {
    const { handler, aggregateRepo, storage, quota, owner } = setup();
    aggregateRepo.save.mockRejectedValueOnce(new Error('mongo down'));

    await expect(
      handler.execute(new PitchShiftVersionCommand(owner, versionId(1), trackId(1), 2)),
    ).rejects.toThrow('mongo down');

    expect(storage.delete).toHaveBeenCalledWith(pitchResult.shiftedS3Key);
    expect(quota.recordUsage).not.toHaveBeenCalled();
  });

  it('propagates audio-processor failures without mutating DB', async () => {
    const { handler, audioClient, aggregateRepo, quota, owner } = setup();
    audioClient.send.mockReturnValueOnce(throwError(() => new Error('AP_DOWN')));

    await expect(
      handler.execute(new PitchShiftVersionCommand(owner, versionId(1), trackId(1), 2)),
    ).rejects.toThrow('AP_DOWN');

    expect(aggregateRepo.save).not.toHaveBeenCalled();
    expect(quota.recordUsage).not.toHaveBeenCalled();
  });
});
