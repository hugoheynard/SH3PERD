import { CommandHandler, type ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { MUSIC_REFERENCE_REPO } from '../../../appBootstrap/nestTokens.js';
import type { IMusicReferenceRepository } from '../../types/musicReferences.types.js';
import type { TUserId, TCreateMusicReferenceRequestDTO, TMusicReferenceDomainModel } from '@sh3pherd/shared-types';
import { MusicReferenceEntity } from '../../domain/entities/MusicReferenceEntity.js';


export class CreateMusicReferenceCommand {
  constructor(
    public readonly actor_id: TUserId,
    public readonly payload: TCreateMusicReferenceRequestDTO,
  ) {}
}

@CommandHandler(CreateMusicReferenceCommand)
export class CreateMusicReferenceHandler
  implements ICommandHandler<CreateMusicReferenceCommand, TMusicReferenceDomainModel> {

  constructor(
    @Inject(MUSIC_REFERENCE_REPO) private readonly refRepo: IMusicReferenceRepository,
  ) {}

  async execute(cmd: CreateMusicReferenceCommand): Promise<TMusicReferenceDomainModel> {
    const title = cmd.payload.title.trim().toLowerCase();
    const artist = cmd.payload.artist.trim().toLowerCase();

    // Deduplicate: return existing if exact match found
    const existing = await this.refRepo.findByExactTitleAndArtist(title, artist);
    if (existing) {
      return existing;
    }

    const ref = new MusicReferenceEntity({
      title: cmd.payload.title,
      artist: cmd.payload.artist,
      owner_id: cmd.actor_id,
    });

    const saved = await this.refRepo.save(ref.toDomain);
    if (!saved) {
      throw new Error('MUSIC_REFERENCE_CREATION_FAILED');
    }

    return ref.toDomain;
  }
}
