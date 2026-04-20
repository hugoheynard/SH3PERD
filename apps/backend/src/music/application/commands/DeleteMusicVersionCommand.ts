import { CommandHandler, type ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { REPERTOIRE_ENTRY_AGGREGATE_REPO } from '../../../appBootstrap/nestTokens.js';
import { TRACK_STORAGE_SERVICE } from '../../infra/storage/storage.tokens.js';
import type { IRepertoireEntryAggregateRepository } from '../../repositories/RepertoireEntryAggregateRepository.js';
import type { ITrackStorageService } from '../../infra/storage/ITrackStorageService.js';
import type { TUserId, TMusicVersionId } from '@sh3pherd/shared-types';
import { AnalyticsEventService } from '../../../analytics/AnalyticsEventService.js';

export class DeleteMusicVersionCommand {
  constructor(
    public readonly actorId: TUserId,
    public readonly versionId: TMusicVersionId,
  ) {}
}

@CommandHandler(DeleteMusicVersionCommand)
export class DeleteMusicVersionHandler implements ICommandHandler<
  DeleteMusicVersionCommand,
  boolean
> {
  constructor(
    @Inject(REPERTOIRE_ENTRY_AGGREGATE_REPO)
    private readonly aggregateRepo: IRepertoireEntryAggregateRepository,
    @Inject(TRACK_STORAGE_SERVICE) private readonly storage: ITrackStorageService,
    private readonly analytics: AnalyticsEventService,
  ) {}

  async execute(cmd: DeleteMusicVersionCommand): Promise<boolean> {
    const aggregate = await this.aggregateRepo.loadByVersionId(cmd.versionId);
    const removed = aggregate.removeVersion(cmd.actorId, cmd.versionId);

    // Delete all tracks from S3 (best-effort)
    for (const track of removed.tracks) {
      if (track.s3Key) {
        await this.storage.delete(track.s3Key).catch(() => {});
      }
    }

    await this.aggregateRepo.save(aggregate);

    await this.analytics.track('music_version_deleted', cmd.actorId, {
      version_id: cmd.versionId,
      reference_id: removed.musicReference_id,
      label: removed.label,
      track_count: removed.tracks.length,
    });

    return true;
  }
}
