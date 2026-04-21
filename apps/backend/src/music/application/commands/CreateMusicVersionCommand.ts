import { CommandHandler, type ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { REPERTOIRE_ENTRY_AGGREGATE_REPO } from '../../../appBootstrap/nestTokens.js';
import type { IRepertoireEntryAggregateRepository } from '../../repositories/RepertoireEntryAggregateRepository.js';
import type {
  TUserId,
  TCreateMusicVersionPayload,
  TMusicVersionDomainModel,
} from '@sh3pherd/shared-types';
import { MusicVersionEntity } from '../../domain/entities/MusicVersionEntity.js';
import { QuotaService } from '../../../quota/QuotaService.js';
import { AnalyticsEventService } from '../../../analytics/AnalyticsEventService.js';
import { TransactionRunner } from '../../../appBootstrap/database/TransactionRunner.js';
import { TechnicalError } from '../../../utils/errorManagement/TechnicalError.js';
import { BusinessError } from '../../../utils/errorManagement/BusinessError.js';
import { MusicApiCodes } from '../../codes.js';

const REPERTOIRE_ENTRY_NOT_FOUND = 'REPERTOIRE_ENTRY_NOT_FOUND';

/**
 * Command to create a new version of a song in a user's repertoire.
 *
 * A version represents a user's specific rendition: cover, acoustic, pitch variant, etc.
 * It starts with zero tracks — audio files are uploaded separately via UploadTrackCommand.
 */
export class CreateMusicVersionCommand {
  constructor(
    public readonly actorId: TUserId,
    public readonly payload: TCreateMusicVersionPayload,
  ) {}
}

/**
 * Creates a new MusicVersionEntity and adds it to the RepertoireEntryAggregate.
 *
 * Flow:
 * 1. Quota check — `ensureAllowed('track_version')` (402 if exceeded)
 * 2. Load aggregate by owner + reference (ensures the user has this song in their repertoire)
 * 3. Construct a new MusicVersionEntity (validates label, owner_id, reference_id via entity invariants)
 * 4. Aggregate.addVersion() → Policy.ensureCanMutateEntry + Policy.ensureCanCreateVersion (max versions check)
 * 5. Persist via aggregate repo inside a transaction (all-or-nothing)
 * 6. Record quota usage + emit analytics event
 *
 * @throws BusinessError(REPERTOIRE_ENTRY_NOT_FOUND, 404) — user doesn't have this reference in their repertoire
 * @throws BusinessError(REPERTOIRE_ENTRY_NOT_OWNED, 403) — actor doesn't own the entry
 * @throws BusinessError(MAX_VERSIONS_PER_REFERENCE_REACHED, 409) — version limit exceeded
 * @throws QuotaExceededError(402) — `track_version` quota exceeded for the actor's plan
 * @throws DomainError — MUSIC_VERSION_LABEL_REQUIRED / OWNER_REQUIRED / REFERENCE_REQUIRED (entity invariants, 400)
 * @throws TechnicalError(MUSIC_VERSION_CREATION_REPO_FAIL, 500) — persistence failure during save
 */
@CommandHandler(CreateMusicVersionCommand)
export class CreateMusicVersionHandler implements ICommandHandler<
  CreateMusicVersionCommand,
  TMusicVersionDomainModel
> {
  constructor(
    @Inject(REPERTOIRE_ENTRY_AGGREGATE_REPO)
    private readonly aggregateRepo: IRepertoireEntryAggregateRepository,
    private readonly quotaService: QuotaService,
    private readonly analytics: AnalyticsEventService,
    private readonly transactionRunner: TransactionRunner,
  ) {}

  async execute(cmd: CreateMusicVersionCommand): Promise<TMusicVersionDomainModel> {
    // Quota check — before creating (402 if exceeded)
    await this.quotaService.ensureAllowed(cmd.actorId, 'track_version');

    const aggregate = await this.aggregateRepo.loadByOwnerAndReference(
      cmd.actorId,
      cmd.payload.musicReference_id,
    );
    if (!aggregate) {
      throw new BusinessError(REPERTOIRE_ENTRY_NOT_FOUND, {
        code: REPERTOIRE_ENTRY_NOT_FOUND,
        status: 404,
      });
    }

    const version = new MusicVersionEntity({
      owner_id: cmd.actorId,
      musicReference_id: cmd.payload.musicReference_id,
      label: cmd.payload.label,
      genre: cmd.payload.genre,
      type: cmd.payload.type,
      bpm: cmd.payload.bpm,
      pitch: cmd.payload.pitch,
      notes: cmd.payload.notes,
      mastery: cmd.payload.mastery,
      energy: cmd.payload.energy,
      effort: cmd.payload.effort,
      tracks: [],
    });

    // Structural invariants (maxVersions, ownership) — throws BusinessError
    aggregate.addVersion(version);

    // Transactional persistence — save new/delete removed/update existing are atomic.
    // Domain errors are thrown by `aggregate.addVersion` above (outside the tx),
    // so only infra failures can reach this catch. We wrap them in a TechnicalError
    // carrying actor + intent context for observability.
    try {
      await this.transactionRunner.run(async (session) => {
        await this.aggregateRepo.save(aggregate, session);
      });
    } catch (err: unknown) {
      throw new TechnicalError(MusicApiCodes.MUSIC_VERSION_CREATION_REPO_FAIL.message, {
        code: MusicApiCodes.MUSIC_VERSION_CREATION_REPO_FAIL.code,
        cause: err as Error,
        context: {
          actorId: cmd.actorId,
          musicReference_id: cmd.payload.musicReference_id,
          versionId: version.id,
          operation: 'CreateMusicVersion.save',
        },
      });
    }

    // Record usage — after successful save
    await this.quotaService.recordUsage(cmd.actorId, 'track_version');

    // Analytics — fire-and-forget, never breaks the primary flow
    await this.analytics.track('music_version_created', cmd.actorId, {
      version_id: version.id,
      reference_id: cmd.payload.musicReference_id,
      genre: cmd.payload.genre,
      type: cmd.payload.type,
    });

    return version.toDomain;
  }
}
