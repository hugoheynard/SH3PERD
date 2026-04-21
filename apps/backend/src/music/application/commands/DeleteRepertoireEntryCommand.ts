import { CommandHandler, type ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import {
  MUSIC_REPERTOIRE_REPO,
  REPERTOIRE_ENTRY_AGGREGATE_REPO,
} from '../../../appBootstrap/nestTokens.js';
import { TRACK_STORAGE_SERVICE } from '../../infra/storage/storage.tokens.js';
import type { IMusicRepertoireRepository } from '../../repositories/MusicRepertoireRepository.js';
import type { IRepertoireEntryAggregateRepository } from '../../repositories/RepertoireEntryAggregateRepository.js';
import type { ITrackStorageService } from '../../infra/storage/ITrackStorageService.js';
import type { TUserId, TRepertoireEntryId } from '@sh3pherd/shared-types';
import { BusinessError } from '../../../utils/errorManagement/BusinessError.js';
import { QuotaService } from '../../../quota/QuotaService.js';
import { AnalyticsEventService } from '../../../analytics/AnalyticsEventService.js';

export class DeleteRepertoireEntryCommand {
  constructor(
    public readonly actorId: TUserId,
    public readonly entryId: TRepertoireEntryId,
  ) {}
}

/**
 * Deletes a user's repertoire entry **and cascades** the cleanup:
 *  1. All versions of the user for this reference are removed via the aggregate.
 *  2. All tracks' S3 objects are deleted (best-effort).
 *  3. `storage_bytes` quota is credited back with the sum of the tracks sizes.
 *  4. `repertoire_entry` quota is credited back (-1).
 *  5. The entry row itself is deleted.
 *  6. A `repertoire_entry_deleted` analytics event is fired.
 *
 * Atomicity notes
 * ----------------
 * - The aggregate.save() opens its own transaction so all version deletes
 *   commit or roll back together.
 * - The entry.delete runs **after** the aggregate save. If the process
 *   crashes between the two, a retried DELETE is idempotent: the aggregate
 *   is loaded with zero versions, nothing to remove, the entry is deleted.
 * - S3 cleanup and quota credits are intentionally outside any transaction.
 *   They are eventual side effects; a stale S3 object or a slightly stale
 *   quota is cheaper than refusing the user operation.
 */
@CommandHandler(DeleteRepertoireEntryCommand)
export class DeleteRepertoireEntryHandler implements ICommandHandler<
  DeleteRepertoireEntryCommand,
  boolean
> {
  constructor(
    @Inject(MUSIC_REPERTOIRE_REPO) private readonly repRepo: IMusicRepertoireRepository,
    @Inject(REPERTOIRE_ENTRY_AGGREGATE_REPO)
    private readonly aggregateRepo: IRepertoireEntryAggregateRepository,
    @Inject(TRACK_STORAGE_SERVICE) private readonly storage: ITrackStorageService,
    private readonly quotaService: QuotaService,
    private readonly analytics: AnalyticsEventService,
  ) {}

  async execute(cmd: DeleteRepertoireEntryCommand): Promise<boolean> {
    const entry = await this.repRepo.findOneByEntryId(cmd.entryId);
    if (!entry) {
      throw new BusinessError('Repertoire entry not found', {
        code: 'REPERTOIRE_ENTRY_NOT_FOUND',
        status: 404,
      });
    }
    if (entry.owner_id !== cmd.actorId) {
      throw new BusinessError('Repertoire entry not owned by actor', {
        code: 'REPERTOIRE_ENTRY_NOT_OWNED',
        status: 403,
      });
    }

    const aggregate = await this.aggregateRepo.loadByOwnerAndReference(
      entry.owner_id,
      entry.musicReference_id,
    );

    // Snapshot everything we need BEFORE mutating the aggregate — after
    // removeVersion() the versions array no longer contains them.
    const versionIds = aggregate.getVersions().map((v) => v.id);
    const s3Keys: string[] = [];
    let totalBytes = 0;
    for (const version of aggregate.getVersions()) {
      for (const track of version.tracks) {
        if (track.s3Key) s3Keys.push(track.s3Key);
        if (track.sizeBytes) totalBytes += track.sizeBytes;
      }
    }

    // Cascade: mark every version for removal via the aggregate so the
    // policy checks + dirty tracking fire exactly like for a single delete.
    for (const vid of versionIds) {
      aggregate.removeVersion(cmd.actorId, vid);
    }

    // Persist version deletions inside the aggregate's own transaction.
    await this.aggregateRepo.save(aggregate);

    // Delete the entry row itself.
    const deleted = await this.repRepo.deleteOneByEntryId(cmd.entryId);

    // Post-commit side effects — S3 + quota are best-effort.
    for (const key of s3Keys) {
      await this.storage.delete(key).catch(() => {});
    }
    if (totalBytes > 0) {
      await this.quotaService.recordUsage(cmd.actorId, 'storage_bytes', -totalBytes);
    }
    await this.quotaService.recordUsage(cmd.actorId, 'repertoire_entry', -1);

    if (deleted) {
      await this.analytics.track('repertoire_entry_deleted', cmd.actorId, {
        entry_id: cmd.entryId,
        reference_id: entry.musicReference_id,
        version_count: versionIds.length,
        total_size_bytes: totalBytes,
      });
    }

    return deleted;
  }
}
