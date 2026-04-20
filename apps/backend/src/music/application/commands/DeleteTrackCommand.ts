import { CommandHandler, type ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { REPERTOIRE_ENTRY_AGGREGATE_REPO } from '../../../appBootstrap/nestTokens.js';
import { TRACK_STORAGE_SERVICE } from '../../infra/storage/storage.tokens.js';
import type { IRepertoireEntryAggregateRepository } from '../../repositories/RepertoireEntryAggregateRepository.js';
import type { ITrackStorageService } from '../../infra/storage/ITrackStorageService.js';
import type { TUserId, TMusicVersionId, TVersionTrackId } from '@sh3pherd/shared-types';
import { AnalyticsEventService } from '../../../analytics/AnalyticsEventService.js';

export class DeleteTrackCommand {
  constructor(
    public readonly actorId: TUserId,
    public readonly versionId: TMusicVersionId,
    public readonly trackId: TVersionTrackId,
  ) {}
}

@CommandHandler(DeleteTrackCommand)
export class DeleteTrackHandler implements ICommandHandler<DeleteTrackCommand, boolean> {
  constructor(
    @Inject(REPERTOIRE_ENTRY_AGGREGATE_REPO)
    private readonly aggregateRepo: IRepertoireEntryAggregateRepository,
    @Inject(TRACK_STORAGE_SERVICE) private readonly storage: ITrackStorageService,
    private readonly analytics: AnalyticsEventService,
  ) {}

  async execute(cmd: DeleteTrackCommand): Promise<boolean> {
    const aggregate = await this.aggregateRepo.loadByVersionId(cmd.versionId);
    const track = aggregate.removeTrack(cmd.actorId, cmd.versionId, cmd.trackId);

    // Delete from S3 (best-effort)
    if (track.s3Key) {
      await this.storage.delete(track.s3Key).catch(() => {});
    }

    await this.aggregateRepo.save(aggregate);

    await this.analytics.track('track_deleted', cmd.actorId, {
      version_id: cmd.versionId,
      track_id: cmd.trackId,
      file_name: track.fileName,
      processing_type: track.processingType,
    });

    return true;
  }
}
