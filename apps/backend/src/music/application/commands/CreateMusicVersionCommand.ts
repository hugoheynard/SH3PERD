import { CommandHandler, type ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { MUSIC_VERSION_REPO } from '../../../appBootstrap/nestTokens.js';
import type { IMusicVersionRepository } from '../../repositories/MusicVersionRepository.js';
import type { TUserId, TCreateMusicVersionPayload, TMusicVersionDomainModel } from '@sh3pherd/shared-types';
import { MusicVersionEntity } from '../../domain/entities/MusicVersionEntity.js';

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

    const saved = await this.versionRepo.saveOne(version.toDomain);
    if (!saved) throw new Error('MUSIC_VERSION_CREATION_FAILED');

    return version.toDomain;
  }
}
