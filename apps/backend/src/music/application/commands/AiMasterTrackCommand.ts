import { Inject } from '@nestjs/common';
import { CommandHandler, EventBus, type ICommandHandler } from '@nestjs/cqrs';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom, timeout } from 'rxjs';
import { REPERTOIRE_ENTRY_AGGREGATE_REPO } from '../../../appBootstrap/nestTokens.js';
import { TRACK_STORAGE_SERVICE } from '../../infra/storage/storage.tokens.js';
import type { IRepertoireEntryAggregateRepository } from '../../repositories/RepertoireEntryAggregateRepository.js';
import type { ITrackStorageService } from '../../infra/storage/ITrackStorageService.js';
import { buildTrackS3Key } from '../../infra/storage/ITrackStorageService.js';
import { BusinessError } from '../../../utils/errorManagement/BusinessError.js';
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
  constructor(
    @Inject(REPERTOIRE_ENTRY_AGGREGATE_REPO)
    private readonly aggregateRepo: IRepertoireEntryAggregateRepository,
    @Inject(TRACK_STORAGE_SERVICE) private readonly storage: ITrackStorageService,
    @Inject('AUDIO_PROCESSOR') private readonly audioClient: ClientProxy,
    private readonly eventBus: EventBus,
    private readonly quotaService: QuotaService,
    private readonly analytics: AnalyticsEventService,
  ) {}

  async execute(cmd: AiMasterTrackCommand): Promise<TVersionTrackDomainModel> {
    const correlationId = newCorrelationId();
    const log = createContextLogger('AiMasterTrackHandler', {
      correlation_id: correlationId,
      user_id: cmd.actorId,
      version_id: cmd.versionId,
      track_id: cmd.trackId,
      reference_track_id: cmd.referenceTrackId,
    });

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
    if (!refVersion) {
      throw new BusinessError('Reference version not found', {
        code: 'REFERENCE_VERSION_NOT_FOUND',
        status: 404,
      });
    }

    const refTrack = refVersion.findTrack(cmd.referenceTrackId);
    if (!refTrack) {
      throw new BusinessError('Reference track not found', {
        code: 'REFERENCE_TRACK_NOT_FOUND',
        status: 404,
      });
    }
    if (!refTrack.s3Key) {
      throw new BusinessError('Reference track is not present in storage', {
        code: 'REFERENCE_TRACK_NOT_IN_STORAGE',
        status: 409,
      });
    }

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
      correlationId,
      s3Key: sourceTrack.s3Key!,
      referenceS3Key: refTrack.s3Key,
      outputS3Key,
      trackId: cmd.trackId,
      versionId: cmd.versionId,
      ownerId: cmd.actorId,
      loudnormTarget: cmd.loudnormTarget,
    };

    log.info('Dispatching AI mastering to audio-processor', {
      output_s3_key: outputS3Key,
    });

    const result = await firstValueFrom(
      this.audioClient
        .send<TAiMasteringResult>(MicroservicePatterns.AudioProcessor.AI_MASTER_TRACK, payload)
        .pipe(timeout(300_000)),
    );

    log.info('AI mastering complete', {
      size_bytes: result.sizeBytes,
      eq_bands: result.predictedParams.eq.length,
      compressor_ratio: result.predictedParams.compressor.ratio,
    });

    // 5. Add mastered track via aggregate
    const masteredTrack: TVersionTrackDomainModel = {
      id: newTrackId,
      fileName: `ai_master_${sourceTrack.fileName}`,
      uploadedAt: Date.now(),
      favorite: false,
      parentTrackId: sourceTrack.id,
      processingType: 'ai_master',
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

    await this.quotaService.recordUsage(cmd.actorId, 'master_ai');
    await this.quotaService.recordUsage(cmd.actorId, 'storage_bytes', result.sizeBytes);

    await this.analytics.track('track_ai_mastered', cmd.actorId, {
      version_id: cmd.versionId,
      track_id: cmd.trackId,
      reference_track_id: cmd.referenceTrackId,
      target_lufs: cmd.loudnormTarget?.targetLUFS,
    });

    return masteredTrack;
  }
}
