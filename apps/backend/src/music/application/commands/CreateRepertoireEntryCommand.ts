import { CommandHandler, type ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { MUSIC_REPERTOIRE_REPO } from '../../../appBootstrap/nestTokens.js';
import type { IMusicRepertoireRepository } from '../../repositories/MusicRepertoireRepository.js';
import type { TUserId, TCreateRepertoireEntryPayload, TMusicRepertoireEntryDomainModel } from '@sh3pherd/shared-types';
import { RepertoireEntryEntity } from '../../domain/entities/RepertoireEntryEntity.js';
import { QuotaService } from '../../../quota/QuotaService.js';

export class CreateRepertoireEntryCommand {
  constructor(
    public readonly actorId: TUserId,
    public readonly payload: TCreateRepertoireEntryPayload,
  ) {}
}

@CommandHandler(CreateRepertoireEntryCommand)
export class CreateRepertoireEntryHandler implements ICommandHandler<CreateRepertoireEntryCommand, TMusicRepertoireEntryDomainModel> {
  constructor(
    @Inject(MUSIC_REPERTOIRE_REPO) private readonly repRepo: IMusicRepertoireRepository,
    private readonly quotaService: QuotaService,
  ) {}

  async execute(cmd: CreateRepertoireEntryCommand): Promise<TMusicRepertoireEntryDomainModel> {
    // Idempotent: if the user already has this reference, return the existing entry
    const existing = await this.repRepo.findByOwnerAndReference(cmd.actorId, cmd.payload.musicReference_id);
    if (existing) return existing;

    // Quota check — before creating
    await this.quotaService.ensureAllowed(cmd.actorId, 'repertoire_entry');

    const entry = new RepertoireEntryEntity({
      musicReference_id: cmd.payload.musicReference_id,
      owner_id: cmd.actorId,
    });

    const saved = await this.repRepo.saveOne(entry.toDomain);
    if (!saved) throw new Error('REPERTOIRE_ENTRY_CREATION_FAILED');

    // Record usage — after successful save
    await this.quotaService.recordUsage(cmd.actorId, 'repertoire_entry');

    return entry.toDomain;
  }
}
