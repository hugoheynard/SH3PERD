import { CommandHandler, type ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { REPERTOIRE_ENTRY_AGGREGATE_REPO } from '../../../appBootstrap/nestTokens.js';
import type { IRepertoireEntryAggregateRepository } from '../../repositories/RepertoireEntryAggregateRepository.js';
import type {
  TUserId,
  TMusicVersionId,
  TUpdateMusicVersionPayload,
  TMusicVersionDomainModel,
} from '@sh3pherd/shared-types';
import { AnalyticsEventService } from '../../../analytics/AnalyticsEventService.js';
import { TransactionRunner } from '../../../appBootstrap/database/TransactionRunner.js';
import { TechnicalError } from '../../../utils/errorManagement/TechnicalError.js';
import { BusinessError } from '../../../utils/errorManagement/BusinessError.js';
import { MusicApiCodes } from '../../codes.js';

function versionNotFound(): BusinessError {
  return new BusinessError(MusicApiCodes.MUSIC_VERSION_NOT_FOUND.code, {
    code: MusicApiCodes.MUSIC_VERSION_NOT_FOUND.code,
    status: 404,
  });
}

/**
 * Command to partially update a music version's metadata (label, genre,
 * type, bpm, pitch, notes, mastery/energy/effort ratings).
 *
 * Ownership is enforced by `MusicPolicy.ensureCanMutateVersion` via the
 * aggregate. An empty patch is a no-op (no DB write, no analytics).
 */
export class UpdateMusicVersionCommand {
  constructor(
    public readonly actorId: TUserId,
    public readonly versionId: TMusicVersionId,
    public readonly patch: TUpdateMusicVersionPayload,
  ) {}
}

/**
 * @throws BusinessError(MUSIC_VERSION_NOT_FOUND, 404) — version doesn't exist
 * @throws BusinessError(MUSIC_VERSION_NOT_OWNED, 403) — actor isn't the owner
 * @throws DomainError(MUSIC_VERSION_LABEL_REQUIRED, 400) — blank label in patch
 * @throws TechnicalError(MUSIC_VERSION_UPDATE_REPO_FAIL, 500) — persistence failure
 */
@CommandHandler(UpdateMusicVersionCommand)
export class UpdateMusicVersionHandler implements ICommandHandler<
  UpdateMusicVersionCommand,
  TMusicVersionDomainModel
> {
  constructor(
    @Inject(REPERTOIRE_ENTRY_AGGREGATE_REPO)
    private readonly aggregateRepo: IRepertoireEntryAggregateRepository,
    private readonly analytics: AnalyticsEventService,
    private readonly transactionRunner: TransactionRunner,
  ) {}

  async execute(cmd: UpdateMusicVersionCommand): Promise<TMusicVersionDomainModel> {
    const aggregate = await this.aggregateRepo.loadByVersionId(cmd.versionId);
    if (!aggregate) throw versionNotFound();

    const changedFields = Object.keys(cmd.patch).filter(
      (k) => cmd.patch[k as keyof TUpdateMusicVersionPayload] !== undefined,
    );

    // No-op short-circuit: empty patch = no DB write, no analytics
    if (changedFields.length === 0) {
      const existing = aggregate.findVersion(cmd.versionId);
      if (!existing) throw versionNotFound();
      return existing.toDomain;
    }

    // Ownership + entity invariants — throws BusinessError / DomainError
    aggregate.updateVersionMetadata(cmd.actorId, cmd.versionId, cmd.patch);

    try {
      await this.transactionRunner.run(async (session) => {
        await this.aggregateRepo.save(aggregate, session);
      });
    } catch (err: unknown) {
      throw new TechnicalError(MusicApiCodes.MUSIC_VERSION_UPDATE_REPO_FAIL.message, {
        code: MusicApiCodes.MUSIC_VERSION_UPDATE_REPO_FAIL.code,
        cause: err as Error,
        context: {
          actorId: cmd.actorId,
          versionId: cmd.versionId,
          changedFields,
          operation: 'UpdateMusicVersion.save',
        },
      });
    }

    await this.analytics.track('music_version_updated', cmd.actorId, {
      version_id: cmd.versionId,
      changed_fields: changedFields,
    });

    const updated = aggregate.findVersion(cmd.versionId);
    if (!updated) throw versionNotFound();
    return updated.toDomain;
  }
}
