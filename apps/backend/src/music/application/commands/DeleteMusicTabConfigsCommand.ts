import { CommandHandler, type ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { MUSIC_TAB_CONFIGS_REPO } from '../../../appBootstrap/nestTokens.js';
import type { IMusicTabConfigsRepository } from '../../repositories/MusicTabConfigsRepository.js';
import type { TUserId } from '@sh3pherd/shared-types';

export class DeleteMusicTabConfigsCommand {
  constructor(public readonly actorId: TUserId) {}
}

@CommandHandler(DeleteMusicTabConfigsCommand)
export class DeleteMusicTabConfigsHandler implements ICommandHandler<
  DeleteMusicTabConfigsCommand,
  boolean
> {
  constructor(@Inject(MUSIC_TAB_CONFIGS_REPO) private readonly repo: IMusicTabConfigsRepository) {}

  async execute(cmd: DeleteMusicTabConfigsCommand): Promise<boolean> {
    return this.repo.deleteByUserId(cmd.actorId);
  }
}
