import { CommandHandler, type ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { MUSIC_VERSION_REPO } from '../../../appBootstrap/nestTokens.js';
import type { IMusicVersionRepository } from '../../repositories/MusicVersionRepository.js';
import type { TUserId, TCreateMusicVersionPayload, TMusicVersionDomainModel } from '@sh3pherd/shared-types';

export class CreateMusicVersionCommand {
  constructor(
    public readonly actorId: TUserId,
    public readonly payload: TCreateMusicVersionPayload,
  ) {}
}

@CommandHandler(CreateMusicVersionCommand)
export class CreateMusicVersionHandler implements ICommandHandler<CreateMusicVersionCommand, TMusicVersionDomainModel> {
  constructor(
    @Inject(MUSIC_VERSION_REPO) private readonly versionRepo: IMusicVersionRepository,
  ) {}

  async execute(cmd: CreateMusicVersionCommand): Promise<TMusicVersionDomainModel> {
    const version: TMusicVersionDomainModel = {
      id: `musicVer_${crypto.randomUUID()}`,
      owner_id: cmd.actorId,
      ...cmd.payload,
      tracks: [],
    };

    const saved = await this.versionRepo.saveOne(version);
    if (!saved) throw new Error('MUSIC_VERSION_CREATION_FAILED');

    return version;
  }
}
