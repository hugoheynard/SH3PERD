import { Inject, Logger } from '@nestjs/common';
import { CommandHandler, EventBus, type ICommandHandler } from '@nestjs/cqrs';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom, timeout } from 'rxjs';
import { REPERTOIRE_ENTRY_AGGREGATE_REPO } from '../../../appBootstrap/nestTokens.js';
import type { IRepertoireEntryAggregateRepository } from '../../repositories/RepertoireEntryAggregateRepository.js';
import { buildTrackS3Key } from '../../infra/storage/ITrackStorageService.js';
import { QuotaService } from '../../../quota/QuotaService.js';
import { AnalyticsEventService } from '../../../analytics/AnalyticsEventService.js';
import { TrackMasteredEvent } from '../events/TrackMasteredEvent.js';
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
  private readonly logger = new Logger(MasterTrackHandler.name);

  constructor(
    @Inject(REPERTOIRE_ENTRY_AGGREGATE_REPO)
    private readonly aggregateRepo: IRepertoireEntryAggregateRepository,
    @Inject('AUDIO_PROCESSOR') private readonly audioClient: ClientProxy,
    private readonly eventBus: EventBus,
    private readonly quotaService: QuotaService,
    private readonly analytics: AnalyticsEventService,
  ) {}

  async execute(cmd: MasterTrackCommand): Promise<TVersionTrackDomainModel> {
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
      s3Key: sourceTrack.s3Key!,
      outputS3Key,
      trackId: cmd.trackId,
      versionId: cmd.versionId,
      ownerId: cmd.actorId,
      measured: { integratedLUFS, truePeakdBTP, loudnessRange },
      target: cmd.target,
    };

    this.logger.log(`Mastering track ${cmd.trackId} → ${outputS3Key}`);

    const result = await firstValueFrom(
      this.audioClient
        .send<TMasteringResult>(MicroservicePatterns.AudioProcessor.MASTER_TRACK, payload)
        .pipe(timeout(300_000)),
    );

    this.logger.log(`Mastering complete — ${result.sizeBytes} bytes`);

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
    await this.aggregateRepo.save(aggregate);

    this.eventBus.publish(
      new TrackMasteredEvent(cmd.actorId, cmd.versionId, newTrackId, result.masteredS3Key),
    );

    await this.quotaService.recordUsage(cmd.actorId, 'master_standard');

    await this.analytics.track('track_mastered', cmd.actorId, {
      version_id: cmd.versionId,
      track_id: cmd.trackId,
      target_lufs: cmd.target.targetLUFS,
      target_tp: cmd.target.targetTP,
    });

    return masteredTrack;
  }
}
