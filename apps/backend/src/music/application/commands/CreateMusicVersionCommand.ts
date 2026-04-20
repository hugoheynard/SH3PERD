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
 * 1. Load aggregate by owner + reference (ensures the user has this song in their repertoire)
 * 2. Construct a new MusicVersionEntity (validates label, owner_id, reference_id via entity invariants)
 * 3. Aggregate.addVersion() → Policy.ensureCanMutateEntry + Policy.ensureCanCreateVersion (max versions check)
 * 4. Persist via aggregate repo (dirty tracking detects the new version)
 *
 * @throws REPERTOIRE_ENTRY_NOT_FOUND — user doesn't have this reference in their repertoire
 * @throws MUSIC_VERSION_LABEL_REQUIRED — empty label (entity invariant)
 * @throws MUSIC_VERSION_OWNER_REQUIRED — missing owner (entity invariant)
 * @throws MUSIC_VERSION_REFERENCE_REQUIRED — missing reference (entity invariant)
 * @throws REPERTOIRE_ENTRY_NOT_OWNED — actor doesn't own the entry (policy)
 * @throws MAX_VERSIONS_PER_REFERENCE_REACHED — version limit exceeded (policy)
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
  ) {}

  async execute(cmd: CreateMusicVersionCommand): Promise<TMusicVersionDomainModel> {
    // Quota check — before creating
    await this.quotaService.ensureAllowed(cmd.actorId, 'track_version');

    const aggregate = await this.aggregateRepo.loadByOwnerAndReference(
      cmd.actorId,
      cmd.payload.musicReference_id,
    );

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

    aggregate.addVersion(version);
    await this.aggregateRepo.save(aggregate);

    // Record usage — after successful save
    await this.quotaService.recordUsage(cmd.actorId, 'track_version');

    await this.analytics.track('music_version_created', cmd.actorId, {
      version_id: version.id,
      reference_id: cmd.payload.musicReference_id,
      label: cmd.payload.label,
      type: cmd.payload.type,
      genre: cmd.payload.genre,
    });

    return version.toDomain;
  }
}
