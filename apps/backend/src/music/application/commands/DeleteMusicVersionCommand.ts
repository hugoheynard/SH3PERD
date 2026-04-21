import { CommandHandler, type ICommandHandler } from '@nestjs/cqrs';
import { Inject, Logger } from '@nestjs/common';
import { REPERTOIRE_ENTRY_AGGREGATE_REPO } from '../../../appBootstrap/nestTokens.js';
import { TRACK_STORAGE_SERVICE } from '../../infra/storage/storage.tokens.js';
import type { IRepertoireEntryAggregateRepository } from '../../repositories/RepertoireEntryAggregateRepository.js';
import type { ITrackStorageService } from '../../infra/storage/ITrackStorageService.js';
import type { TUserId, TMusicVersionId } from '@sh3pherd/shared-types';
import { QuotaService } from '../../../quota/QuotaService.js';
import { AnalyticsEventService } from '../../../analytics/AnalyticsEventService.js';

/**
 * Command to delete a version and every version derived from it.
 *
 * The DB save runs inside the aggregate repo's transaction (source of
 * truth). S3 cleanup + quota restitution + analytics are post-save side
 * effects — their failure must not break the primary flow:
 * - S3 deletes run in parallel and failures are logged (orphan objects
 *   are tolerable, dangling DB pointers are not).
 * - `storage_bytes` is credited back once, summing across all removed
 *   tracks (requires `sizeBytes` persisted at ingest).
 * - `master_standard` / `master_ai` / `pitch_shift` are NOT credited
 *   back — those quotas meter service invocation, not kept artefacts.
 */
export class DeleteMusicVersionCommand {
  constructor(
    public readonly actorId: TUserId,
    public readonly versionId: TMusicVersionId,
  ) {}
}

/**
 * @throws BusinessError(MUSIC_VERSION_NOT_FOUND, 404) — version doesn't exist
 * @throws DomainError(MUSIC_VERSION_NOT_OWNED, 400) — actor isn't the owner
 * @throws TechnicalError(REPERTOIRE_AGGREGATE_SAVE_FAILED, 500) — persistence failure
 */
@CommandHandler(DeleteMusicVersionCommand)
export class DeleteMusicVersionHandler implements ICommandHandler<
  DeleteMusicVersionCommand,
  boolean
> {
  private readonly logger = new Logger(DeleteMusicVersionHandler.name);

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

    // Snapshot cleanup inputs BEFORE the save clears the tracks arrays.
    const s3Keys: string[] = [];
    let totalBytes = 0;
    for (const version of removed) {
      for (const track of version.tracks) {
        if (track.s3Key) s3Keys.push(track.s3Key);
        if (track.sizeBytes) totalBytes += track.sizeBytes;
      }
    }

    // 1. Persist deletion first — DB is the source of truth. If this
    //    throws, S3 + quota + analytics do NOT run.
    await this.aggregateRepo.save(aggregate);

    // 2. Best-effort S3 cleanup in parallel. Orphan objects are tolerable
    //    (a sweeper can reconcile), so failures are logged and swallowed
    //    rather than fail the request.
    await Promise.all(
      s3Keys.map((key) =>
        this.storage.delete(key).catch((err: unknown) => {
          this.logger.warn(
            `S3 delete failed for key ${key} (version ${cmd.versionId}): ${
              err instanceof Error ? err.message : String(err)
            }`,
          );
        }),
      ),
    );

    // 3. Quota restitution — storage only. Derivation quotas meter past
    //    invocations, not kept artefacts, so they are not credited back.
    if (totalBytes > 0) {
      await this.quotaService.recordUsage(cmd.actorId, 'storage_bytes', -totalBytes);
    }

    // 4. Analytics — fire-and-forget.
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
