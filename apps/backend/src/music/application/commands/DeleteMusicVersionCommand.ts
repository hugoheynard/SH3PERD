import { CommandHandler, type ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { REPERTOIRE_ENTRY_AGGREGATE_REPO } from '../../../appBootstrap/nestTokens.js';
import { TRACK_STORAGE_SERVICE } from '../../infra/storage/storage.tokens.js';
import type { IRepertoireEntryAggregateRepository } from '../../repositories/RepertoireEntryAggregateRepository.js';
import type { ITrackStorageService } from '../../infra/storage/ITrackStorageService.js';
import type { TUserId, TMusicVersionId } from '@sh3pherd/shared-types';
import { QuotaService } from '../../../quota/QuotaService.js';
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
    private readonly quotaService: QuotaService,
    private readonly analytics: AnalyticsEventService,
  ) {}

  async execute(cmd: DeleteMusicVersionCommand): Promise<boolean> {
    const aggregate = await this.aggregateRepo.loadByVersionId(cmd.versionId);
    const removed = aggregate.removeVersion(cmd.actorId, cmd.versionId);

    // Snapshot cleanup inputs BEFORE the save wipes the aggregate-tracked data
    const s3Keys = removed.tracks.map((t) => t.s3Key).filter((k): k is string => !!k);
    const totalBytes = removed.tracks.reduce((sum, t) => sum + (t.sizeBytes ?? 0), 0);

    await this.aggregateRepo.save(aggregate);

    // Post-save cleanup: DB is now consistent, S3 + quota are eventual side effects
    for (const key of s3Keys) {
      await this.storage.delete(key).catch(() => {});
    }
    if (totalBytes > 0) {
      await this.quotaService.recordUsage(cmd.actorId, 'storage_bytes', -totalBytes);
    }

    await this.analytics.track('music_version_deleted', cmd.actorId, {
      version_id: cmd.versionId,
      reference_id: removed.musicReference_id,
      label: removed.label,
      track_count: removed.tracks.length,
      total_size_bytes: totalBytes,
    });

    return true;
  }
}
