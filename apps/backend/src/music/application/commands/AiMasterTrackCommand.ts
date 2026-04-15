import { Inject, Logger } from '@nestjs/common';
import { CommandHandler, type ICommandHandler } from '@nestjs/cqrs';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom, timeout } from 'rxjs';
import { REPERTOIRE_ENTRY_AGGREGATE_REPO } from '../../../appBootstrap/nestTokens.js';
import type { IRepertoireEntryAggregateRepository } from '../../repositories/RepertoireEntryAggregateRepository.js';
import { buildTrackS3Key } from '../../infra/storage/ITrackStorageService.js';
import { QuotaService } from '../../../quota/QuotaService.js';
import { AnalyticsEventService } from '../../../analytics/AnalyticsEventService.js';
import {
  MicroservicePatterns,
  type TUserId,
  type TMusicVersionId,
  type TVersionTrackId,
  type TVersionTrackDomainModel,
  type TAiMasterTrackPayload,
  type TAiMasteringResult,
  type TMasteringTargetSpecs,
} from '@sh3pherd/shared-types';

/**
 * Command: AI-master a track via DeepAFx-ST style transfer.
 *
 * Takes a source track + a reference track, dispatches to the
 * audio-processor's AI_MASTER_TRACK handler, and stores the
 * mastered output as a new track on the same version.
 *
 * The reference track can be from any version in the user's library
 * (or, in the future, from a built-in preset). The handler validates
 * that both tracks have s3Keys and that the source has analysis data.
 */
export class AiMasterTrackCommand {
  constructor(
    public readonly actorId: TUserId,
    public readonly versionId: TMusicVersionId,
    public readonly trackId: TVersionTrackId,
    /** The reference track to match the style of. */
    public readonly referenceVersionId: TMusicVersionId,
    public readonly referenceTrackId: TVersionTrackId,
    /** Optional LUFS/TP/LRA target for loudnorm stage 2. */
    public readonly loudnormTarget?: TMasteringTargetSpecs,
  ) {}
}

@CommandHandler(AiMasterTrackCommand)
export class AiMasterTrackHandler implements ICommandHandler<
  AiMasterTrackCommand,
  TVersionTrackDomainModel
> {
  private readonly logger = new Logger(AiMasterTrackHandler.name);

  constructor(
    @Inject(REPERTOIRE_ENTRY_AGGREGATE_REPO)
    private readonly aggregateRepo: IRepertoireEntryAggregateRepository,
    @Inject('AUDIO_PROCESSOR') private readonly audioClient: ClientProxy,
    private readonly quotaService: QuotaService,
    private readonly analytics: AnalyticsEventService,
  ) {}

  async execute(cmd: AiMasterTrackCommand): Promise<TVersionTrackDomainModel> {
    // 0. Quota check
    await this.quotaService.ensureAllowed(cmd.actorId, 'master_ai');

    // 1. Load and validate source track via aggregate
    const aggregate = await this.aggregateRepo.loadByVersionId(cmd.versionId);
    const version = aggregate.ensureCanMasterTrack(cmd.actorId, cmd.versionId, cmd.trackId);
    const sourceTrack = version.findTrack(cmd.trackId)!;

    // 2. Load and validate reference track
    //    The reference can be on the same aggregate (same reference) or
    //    a different one. We load by versionId which resolves the correct
    //    aggregate.
    const refAggregate =
      cmd.referenceVersionId === cmd.versionId
        ? aggregate
        : await this.aggregateRepo.loadByVersionId(cmd.referenceVersionId);

    const refVersion = refAggregate.findVersion(cmd.referenceVersionId);
    if (!refVersion) throw new Error('REFERENCE_VERSION_NOT_FOUND');

    const refTrack = refVersion.findTrack(cmd.referenceTrackId);
    if (!refTrack) throw new Error('REFERENCE_TRACK_NOT_FOUND');
    if (!refTrack.s3Key) throw new Error('REFERENCE_TRACK_NOT_IN_STORAGE');

    // 3. Generate output S3 key
    const newTrackId = `track_${crypto.randomUUID()}` as TVersionTrackId;
    const outputS3Key = buildTrackS3Key(
      cmd.actorId,
      cmd.versionId,
      newTrackId,
      `ai_master_${sourceTrack.fileName}`,
    );

    // 4. Build payload and dispatch to audio-processor
    const payload: TAiMasterTrackPayload = {
      s3Key: sourceTrack.s3Key!,
      referenceS3Key: refTrack.s3Key,
      outputS3Key,
      trackId: cmd.trackId,
      versionId: cmd.versionId,
      ownerId: cmd.actorId,
      loudnormTarget: cmd.loudnormTarget,
    };

    this.logger.log(
      `AI-mastering track ${cmd.trackId} using ref ${cmd.referenceTrackId} → ${outputS3Key}`,
    );

    const result = await firstValueFrom(
      this.audioClient
        .send<TAiMasteringResult>(MicroservicePatterns.AudioProcessor.AI_MASTER_TRACK, payload)
        .pipe(timeout(300_000)),
    );

    this.logger.log(
      `AI mastering complete — ${result.sizeBytes} bytes, ` +
        `EQ bands: ${result.predictedParams.eq.length}, ratio: ${result.predictedParams.compressor.ratio}:1`,
    );

    // 5. Add mastered track via aggregate
    const masteredTrack: TVersionTrackDomainModel = {
      id: newTrackId,
      fileName: `ai_master_${sourceTrack.fileName}`,
      uploadedAt: Date.now(),
      favorite: false,
      parentTrackId: sourceTrack.id,
      processingType: 'ai_master',
      s3Key: result.masteredS3Key,
    };

    aggregate.addTrack(cmd.actorId, cmd.versionId, masteredTrack);
    await this.aggregateRepo.save(aggregate);

    await this.quotaService.recordUsage(cmd.actorId, 'master_ai');

    await this.analytics.track('track_ai_mastered', cmd.actorId, {
      version_id: cmd.versionId,
      track_id: cmd.trackId,
      reference_track_id: cmd.referenceTrackId,
      target_lufs: cmd.loudnormTarget?.targetLUFS,
    });

    return masteredTrack;
  }
}
