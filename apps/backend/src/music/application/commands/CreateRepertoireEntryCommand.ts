import { CommandHandler, type ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { MUSIC_REPERTOIRE_REPO } from '../../../appBootstrap/nestTokens.js';
import type { IMusicRepertoireRepository } from '../../repositories/MusicRepertoireRepository.js';
import type { TUserId, TCreateRepertoireEntryPayload, TMusicRepertoireEntryDomainModel } from '@sh3pherd/shared-types';

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
  ) {}

  async execute(cmd: CreateRepertoireEntryCommand): Promise<TMusicRepertoireEntryDomainModel> {
    const entry: TMusicRepertoireEntryDomainModel = {
      id: `repEntry_${crypto.randomUUID()}`,
      musicReference_id: cmd.payload.musicReference_id,
      user_id: cmd.actorId,
    };

    const saved = await this.repRepo.saveOne(entry);
    if (!saved) throw new Error('REPERTOIRE_ENTRY_CREATION_FAILED');

    return entry;
  }
}
