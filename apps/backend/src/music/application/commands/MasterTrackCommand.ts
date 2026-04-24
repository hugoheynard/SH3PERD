import { Inject } from '@nestjs/common';
import { CommandHandler, EventBus, type ICommandHandler } from '@nestjs/cqrs';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom, timeout } from 'rxjs';
import { REPERTOIRE_ENTRY_AGGREGATE_REPO } from '../../../appBootstrap/nestTokens.js';
import { TRACK_STORAGE_SERVICE } from '../../infra/storage/storage.tokens.js';
import type { IRepertoireEntryAggregateRepository } from '../../repositories/RepertoireEntryAggregateRepository.js';
import type { ITrackStorageService } from '../../infra/storage/ITrackStorageService.js';
import { buildTrackS3Key } from '../../infra/storage/ITrackStorageService.js';
import { QuotaService } from '../../../quota/QuotaService.js';
import { AnalyticsEventService } from '../../../analytics/AnalyticsEventService.js';
import { TrackMasteredEvent } from '../events/TrackMasteredEvent.js';
import { createContextLogger, newCorrelationId } from '../../../utils/logging/ContextLogger.js';
import {
  MicroservicePatterns,
  type TUserId,
  type TMusicVersionId,
  type TVersionTrackId,
  type TVersionTrackDomainModel,
  type TMasterTrackPayload,
  type TMasteringResult,
  type TMasteringTargetSpecs,
} from '@sh3pherd/shared-types';

export class MasterTrackCommand {
  constructor(
    public readonly actorId: TUserId,
    public readonly versionId: TMusicVersionId,
    public readonly trackId: TVersionTrackId,
    public readonly target: TMasteringTargetSpecs,
  ) {}
}

@CommandHandler(MasterTrackCommand)
export class MasterTrackHandler implements ICommandHandler<
  MasterTrackCommand,
  TVersionTrackDomainModel
> {
  constructor(
    @Inject(REPERTOIRE_ENTRY_AGGREGATE_REPO)
    private readonly aggregateRepo: IRepertoireEntryAggregateRepository,
    @Inject(TRACK_STORAGE_SERVICE) private readonly storage: ITrackStorageService,
    @Inject('AUDIO_PROCESSOR') private readonly audioClient: ClientProxy,
    private readonly eventBus: EventBus,
    private readonly quotaService: QuotaService,
    private readonly analytics: AnalyticsEventService,
  ) {}

  async execute(cmd: MasterTrackCommand): Promise<TVersionTrackDomainModel> {
    const correlationId = newCorrelationId();
    const log = createContextLogger('MasterTrackHandler', {
      correlation_id: correlationId,
      user_id: cmd.actorId,
      version_id: cmd.versionId,
      track_id: cmd.trackId,
    });

    // 0. Quota check
    await this.quotaService.ensureAllowed(cmd.actorId, 'master_standard');

    // 1. Load and validate via aggregate
    const aggregate = await this.aggregateRepo.loadByVersionId(cmd.versionId);
    const version = aggregate.ensureCanMasterTrack(cmd.actorId, cmd.versionId, cmd.trackId);
    const sourceTrack = version.findTrack(cmd.trackId)!;

    // 2. Generate output S3 key
    const newTrackId = `track_${crypto.randomUUID()}` as TVersionTrackId;
    const outputS3Key = buildTrackS3Key(
      cmd.actorId,
      cmd.versionId,
      newTrackId,
      `master_${sourceTrack.fileName}`,
    );

    // 3. Send to audio-processor
    const { integratedLUFS, truePeakdBTP, loudnessRange } = sourceTrack.analysisResult!;
    const payload: TMasterTrackPayload = {
      correlationId,
      s3Key: sourceTrack.s3Key!,
      outputS3Key,
      trackId: cmd.trackId,
      versionId: cmd.versionId,
      ownerId: cmd.actorId,
      measured: { integratedLUFS, truePeakdBTP, loudnessRange },
      target: cmd.target,
    };

    log.info('Dispatching mastering to audio-processor', {
      output_s3_key: outputS3Key,
    });

    const result = await firstValueFrom(
      this.audioClient
        .send<TMasteringResult>(MicroservicePatterns.AudioProcessor.MASTER_TRACK, payload)
        .pipe(timeout(300_000)),
    );

    log.info('Mastering complete', { size_bytes: result.sizeBytes });

    // 4. Add mastered track via aggregate
    const masteredTrack: TVersionTrackDomainModel = {
      id: newTrackId,
      fileName: `master_${sourceTrack.fileName}`,
      uploadedAt: Date.now(),
      favorite: false,
      parentTrackId: sourceTrack.id,
      processingType: 'master',
      s3Key: result.masteredS3Key,
      sizeBytes: result.sizeBytes,
    };

    aggregate.addTrack(cmd.actorId, cmd.versionId, masteredTrack);

    try {
      await this.aggregateRepo.save(aggregate);
    } catch (e) {
      await this.storage.delete(result.masteredS3Key).catch(() => {});
      throw e;
    }

    this.eventBus.publish(
      new TrackMasteredEvent(
        cmd.actorId,
        cmd.versionId,
        newTrackId,
        result.masteredS3Key,
        correlationId,
      ),
    );

    await this.quotaService.recordUsage(cmd.actorId, 'master_standard');
    await this.quotaService.recordUsage(cmd.actorId, 'storage_bytes', result.sizeBytes);

    await this.analytics.track('track_mastered', cmd.actorId, {
      version_id: cmd.versionId,
      track_id: cmd.trackId,
      target_lufs: cmd.target.targetLUFS,
      target_tp: cmd.target.targetTP,
    });

    return masteredTrack;
  }
}
