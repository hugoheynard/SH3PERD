import { CommandHandler, type ICommandHandler } from '@nestjs/cqrs';
import { Inject, Logger } from '@nestjs/common';
import { REPERTOIRE_ENTRY_AGGREGATE_REPO } from '../../../appBootstrap/nestTokens.js';
import { TRACK_STORAGE_SERVICE } from '../../infra/storage/storage.tokens.js';
import type { IRepertoireEntryAggregateRepository } from '../../repositories/RepertoireEntryAggregateRepository.js';
import type { ITrackStorageService } from '../../infra/storage/ITrackStorageService.js';
import type { TUserId, TMusicVersionId, TVersionTrackDomainModel } from '@sh3pherd/shared-types';
import { QuotaService } from '../../../quota/QuotaService.js';
import { AnalyticsEventService } from '../../../analytics/AnalyticsEventService.js';
import { TransactionRunner } from '../../../appBootstrap/database/TransactionRunner.js';
import { TechnicalError } from '../../../utils/errorManagement/TechnicalError.js';
import { BusinessError } from '../../../utils/errorManagement/BusinessError.js';
import { MusicApiCodes } from '../../codes.js';

/**
 * Command to delete a music version and all its tracks.
 *
 * Ownership is enforced by `MusicPolicy.ensureCanMutateVersion` via the
 * aggregate. The DB record is removed inside a transaction BEFORE S3
 * deletion — so a failure after the transaction leaves orphan S3 objects
 * (tolerable, cleanable by a sweeper) rather than dangling DB pointers.
 */
export class DeleteMusicVersionCommand {
  constructor(
    public readonly actorId: TUserId,
    public readonly versionId: TMusicVersionId,
  ) {}
}

/**
 * @throws BusinessError(MUSIC_VERSION_NOT_FOUND, 404) — version doesn't exist
 * @throws BusinessError(MUSIC_VERSION_NOT_OWNED, 403) — actor isn't the owner
 * @throws TechnicalError(MUSIC_VERSION_DELETE_REPO_FAIL, 500) — persistence failure
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
    private readonly transactionRunner: TransactionRunner,
  ) {}

  async execute(cmd: DeleteMusicVersionCommand): Promise<boolean> {
    const aggregate = await this.aggregateRepo.loadByVersionId(cmd.versionId);
    if (!aggregate) {
      throw new BusinessError(MusicApiCodes.MUSIC_VERSION_NOT_FOUND.code, {
        code: MusicApiCodes.MUSIC_VERSION_NOT_FOUND.code,
        status: 404,
      });
    }

    // Ownership + existence in-aggregate — throws BusinessError from MusicPolicy
    const removed = aggregate.removeVersion(cmd.actorId, cmd.versionId);
    const removedTracks: readonly TVersionTrackDomainModel[] = removed.tracks;

    // 1. Persist deletion first (source of truth). Domain errors were thrown
    //    above (aggregate.removeVersion), so only infra can reach this catch.
    try {
      await this.transactionRunner.run(async (session) => {
        await this.aggregateRepo.save(aggregate, session);
      });
    } catch (err: unknown) {
      throw new TechnicalError(MusicApiCodes.MUSIC_VERSION_DELETE_REPO_FAIL.message, {
        code: MusicApiCodes.MUSIC_VERSION_DELETE_REPO_FAIL.code,
        cause: err as Error,
        context: {
          actorId: cmd.actorId,
          versionId: cmd.versionId,
          numTracks: removedTracks.length,
          operation: 'DeleteMusicVersion.save',
        },
      });
    }

    // 2. Release quota — version count decrements (storage_bytes cannot be
    //    released precisely: fileSizeBytes is not persisted on the track
    //    domain model; sweep + reconcile is tracked as post-ship work).
    await this.quotaService.recordUsage(cmd.actorId, 'track_version', -1);

    // 3. Best-effort S3 cleanup in parallel — orphan objects are tolerable,
    //    DB dangling pointers are not (that's why we save first).
    await Promise.all(
      removedTracks
        .filter((t): t is TVersionTrackDomainModel & { s3Key: string } => Boolean(t.s3Key))
        .map((track) =>
          this.storage.delete(track.s3Key).catch((err: unknown) => {
            this.logger.warn(
              `S3 delete failed for track ${track.id} (version ${cmd.versionId}): ${
                err instanceof Error ? err.message : String(err)
              }`,
            );
          }),
        ),
    );

    // 4. Analytics — fire-and-forget
    await this.analytics.track('music_version_deleted', cmd.actorId, {
      version_id: cmd.versionId,
      num_tracks: removedTracks.length,
    });

    return true;
  }
}
