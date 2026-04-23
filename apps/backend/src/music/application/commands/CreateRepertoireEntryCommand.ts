import { CommandHandler, type ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { MUSIC_REPERTOIRE_REPO } from '../../../appBootstrap/nestTokens.js';
import type { IMusicRepertoireRepository } from '../../repositories/MusicRepertoireRepository.js';
import type {
  TUserId,
  TCreateRepertoireEntryPayload,
  TMusicRepertoireEntryDomainModel,
} from '@sh3pherd/shared-types';
import { RepertoireEntryEntity } from '../../domain/entities/RepertoireEntryEntity.js';
import { TechnicalError } from '../../../utils/errorManagement/TechnicalError.js';
import { QuotaService } from '../../../quota/QuotaService.js';
import { AnalyticsEventService } from '../../../analytics/AnalyticsEventService.js';

export class CreateRepertoireEntryCommand {
  constructor(
    public readonly actorId: TUserId,
    public readonly payload: TCreateRepertoireEntryPayload,
  ) {}
}

@CommandHandler(CreateRepertoireEntryCommand)
export class CreateRepertoireEntryHandler implements ICommandHandler<
  CreateRepertoireEntryCommand,
  TMusicRepertoireEntryDomainModel
> {
  constructor(
    @Inject(MUSIC_REPERTOIRE_REPO) private readonly repRepo: IMusicRepertoireRepository,
    private readonly quotaService: QuotaService,
    private readonly analytics: AnalyticsEventService,
  ) {}

  async execute(cmd: CreateRepertoireEntryCommand): Promise<TMusicRepertoireEntryDomainModel> {
    // Idempotent: if the user already has this reference, return the existing entry.
    // Check first so the quota service is not called for a no-op create.
    const existing = await this.repRepo.findByOwnerAndReference(
      cmd.actorId,
      cmd.payload.musicReference_id,
    );
    if (existing) {
      return existing;
    }

    // Quota check — before creating a new entry.
    await this.quotaService.ensureAllowed(cmd.actorId, 'repertoire_entry');

    const entry = new RepertoireEntryEntity({
      musicReference_id: cmd.payload.musicReference_id,
      owner_id: cmd.actorId,
    });

    const saved = await this.repRepo.saveOne(entry.toDomain);
    if (!saved) {
      throw new TechnicalError('Failed to persist repertoire entry', {
        code: 'REPERTOIRE_ENTRY_CREATION_FAILED',
        context: {
          actor_id: cmd.actorId,
          reference_id: cmd.payload.musicReference_id,
          operation: 'MusicRepertoireRepository.saveOne',
        },
      });
    }

    // Record usage — after successful save
    await this.quotaService.recordUsage(cmd.actorId, 'repertoire_entry');

    await this.analytics.track('repertoire_entry_created', cmd.actorId, {
      entry_id: entry.id,
      reference_id: cmd.payload.musicReference_id,
    });

    return entry.toDomain;
  }
}
