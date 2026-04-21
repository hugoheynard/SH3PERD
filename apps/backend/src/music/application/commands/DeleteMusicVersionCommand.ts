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

    // Cascade: the source version AND every version derived from it
    // (pitch-shift children, future derivation types) are removed in one
    // transactional save. Prevents orphaned `parentVersionId` pointers.
    const removed = aggregate.removeVersionWithDerivations(cmd.actorId, cmd.versionId);

    // Snapshot cleanup inputs BEFORE the save clears the tracks arrays
    const s3Keys: string[] = [];
    let totalBytes = 0;
    for (const version of removed) {
      for (const track of version.tracks) {
        if (track.s3Key) {
          s3Keys.push(track.s3Key);
        }
        if (track.sizeBytes) {
          totalBytes += track.sizeBytes;
        }
      }
    }

    await this.aggregateRepo.save(aggregate);

    // Post-save cleanup: DB is now consistent, S3 + quota are eventual side effects.
    // Note: master_standard, master_ai, pitch_shift counters are intentionally
    // NOT credited back — those quotas meter "times the service was invoked
    // in the period", not "results kept on disk". Deleting a derivative does
    // not un-invoke a past mastering run.
    for (const key of s3Keys) {
      await this.storage.delete(key).catch(() => {});
    }
    if (totalBytes > 0) {
      await this.quotaService.recordUsage(cmd.actorId, 'storage_bytes', -totalBytes);
    }

    const source = removed[0];
    await this.analytics.track('music_version_deleted', cmd.actorId, {
      version_id: cmd.versionId,
      reference_id: source.musicReference_id,
      label: source.label,
      track_count: removed.reduce((sum, v) => sum + v.tracks.length, 0),
      derivation_count: removed.length - 1,
      total_size_bytes: totalBytes,
    });

    return true;
  }
}
