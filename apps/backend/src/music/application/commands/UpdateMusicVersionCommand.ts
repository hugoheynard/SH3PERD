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

/**
 * Command to partially update a music version's metadata (label, genre,
 * type, bpm, pitch, notes, mastery/energy/effort ratings).
 *
 * Ownership is enforced by `MusicPolicy.ensureCanMutateVersion` via the
 * aggregate (403 if not owner). An empty / all-undefined patch is a
 * no-op — no DB write, no analytics.
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
 * @throws DomainError(MUSIC_VERSION_NOT_OWNED, 400) — actor isn't the owner
 * @throws DomainError(MUSIC_VERSION_LABEL_REQUIRED, 400) — blank label in patch
 * @throws TechnicalError(REPERTOIRE_AGGREGATE_SAVE_FAILED, 500) — persistence failure
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
  ) {}

  async execute(cmd: UpdateMusicVersionCommand): Promise<TMusicVersionDomainModel> {
    const aggregate = await this.aggregateRepo.loadByVersionId(cmd.versionId);

    // Only keep fields actually present in the patch (non-undefined).
    const changes = Object.fromEntries(
      Object.entries(cmd.patch).filter(([, v]) => v !== undefined),
    );
    const updatedFields = Object.keys(changes);

    // No-op short-circuit: empty / all-undefined patch → return current
    // state without touching the DB or emitting analytics.
    if (updatedFields.length === 0) {
      // getVersionOrThrow happens inside the aggregate when we mutate;
      // here the aggregate returned successfully, so the version exists.
      return aggregate.findVersion(cmd.versionId)!.toDomain;
    }

    // Ownership + entity invariants — throws DomainError.
    aggregate.updateVersionMetadata(cmd.actorId, cmd.versionId, cmd.patch);
    await this.aggregateRepo.save(aggregate);

    // findVersion is guaranteed non-null — updateVersionMetadata would
    // have thrown otherwise.
    const version = aggregate.findVersion(cmd.versionId)!;

    await this.analytics.track('music_version_updated', cmd.actorId, {
      version_id: cmd.versionId,
      reference_id: version.toDomain.musicReference_id,
      updated_fields: updatedFields,
      changes,
    });

    return version.toDomain;
  }
}
