import { CommandHandler, type ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { MUSIC_REPERTOIRE_REPO } from '../../../appBootstrap/nestTokens.js';
import type { IMusicRepertoireRepository } from '../../repositories/MusicRepertoireRepository.js';
import type { TUserId, TRepertoireEntryId } from '@sh3pherd/shared-types';

export class DeleteRepertoireEntryCommand {
  constructor(
    public readonly actorId: TUserId,
    public readonly entryId: TRepertoireEntryId,
  ) {}
}

@CommandHandler(DeleteRepertoireEntryCommand)
export class DeleteRepertoireEntryHandler implements ICommandHandler<DeleteRepertoireEntryCommand, boolean> {
  constructor(
    @Inject(MUSIC_REPERTOIRE_REPO) private readonly repRepo: IMusicRepertoireRepository,
  ) {}

  async execute(cmd: DeleteRepertoireEntryCommand): Promise<boolean> {
    // TODO: verify ownership (entry.user_id === actorId) before deleting
    return this.repRepo.deleteOneByEntryId(cmd.entryId);
  }
}
