import { CommandHandler, EventBus, type ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { REPERTOIRE_ENTRY_AGGREGATE_REPO } from '../../../appBootstrap/nestTokens.js';
import { TRACK_STORAGE_SERVICE } from '../../infra/storage/storage.tokens.js';
import type { IRepertoireEntryAggregateRepository } from '../../repositories/RepertoireEntryAggregateRepository.js';
import type { ITrackStorageService } from '../../infra/storage/ITrackStorageService.js';
import { buildTrackS3Key } from '../../infra/storage/ITrackStorageService.js';
import type {
  TUserId,
  TMusicVersionId,
  TUploadTrackPayload,
  TVersionTrackDomainModel,
} from '@sh3pherd/shared-types';
import { TrackUploadedEvent } from '../events/TrackUploadedEvent.js';
import { QuotaService } from '../../../quota/QuotaService.js';
import { AnalyticsEventService } from '../../../analytics/AnalyticsEventService.js';

export class UploadTrackCommand {
  constructor(
    public readonly actorId: TUserId,
    public readonly versionId: TMusicVersionId,
    public readonly file: Buffer,
    public readonly contentType: string,
    public readonly payload: TUploadTrackPayload,
  ) {}
}

@CommandHandler(UploadTrackCommand)
export class UploadTrackHandler implements ICommandHandler<
  UploadTrackCommand,
  TVersionTrackDomainModel
> {
  constructor(
    @Inject(REPERTOIRE_ENTRY_AGGREGATE_REPO)
    private readonly aggregateRepo: IRepertoireEntryAggregateRepository,
    @Inject(TRACK_STORAGE_SERVICE) private readonly storage: ITrackStorageService,
    private readonly eventBus: EventBus,
    private readonly quotaService: QuotaService,
    private readonly analytics: AnalyticsEventService,
  ) {}

  async execute(cmd: UploadTrackCommand): Promise<TVersionTrackDomainModel> {
    // Quota checks — before any S3 upload or domain mutation
    await this.quotaService.ensureAllowed(cmd.actorId, 'track_upload');
    await this.quotaService.ensureAllowed(cmd.actorId, 'storage_bytes', cmd.file.length);

    const aggregate = await this.aggregateRepo.loadByVersionId(cmd.versionId);

    // Domain validation — structural invariants
    const version = aggregate.ensureCanAddTrack(cmd.actorId, cmd.versionId);
    const isFirstTrack = version.tracks.length === 0;

    const trackId = `track_${crypto.randomUUID()}` as const;
    const s3Key = buildTrackS3Key(cmd.actorId, cmd.versionId, trackId, cmd.payload.fileName);

    // Upload to S3 first
    await this.storage.upload(s3Key, cmd.file, cmd.contentType);

    const track: TVersionTrackDomainModel = {
      id: trackId,
      fileName: cmd.payload.fileName,
      durationSeconds: cmd.payload.durationSeconds,
      uploadedAt: Date.now(),
      favorite: isFirstTrack,
      s3Key,
    };

    // Mutate aggregate
    aggregate.addTrack(cmd.actorId, cmd.versionId, track);

    try {
      await this.aggregateRepo.save(aggregate);
    } catch (e) {
      // Compensate: delete orphaned S3 object
      await this.storage.delete(s3Key).catch(() => {});
      throw e;
    }

    // Record usage — after successful save
    await this.quotaService.recordUsage(cmd.actorId, 'track_upload');
    await this.quotaService.recordUsage(cmd.actorId, 'storage_bytes', cmd.file.length);

    // Async: trigger audio analysis
    this.eventBus.publish(new TrackUploadedEvent(cmd.actorId, cmd.versionId, trackId, s3Key));

    await this.analytics.track('track_uploaded', cmd.actorId, {
      version_id: cmd.versionId,
      track_id: trackId,
      file_name: cmd.payload.fileName,
      file_size_bytes: cmd.file.length,
      duration_seconds: cmd.payload.durationSeconds,
      format: cmd.contentType,
    });

    return track;
  }
}
