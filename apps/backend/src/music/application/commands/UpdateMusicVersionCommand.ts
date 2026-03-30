import { CommandHandler, type ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { MUSIC_VERSION_REPO } from '../../../appBootstrap/nestTokens.js';
import type { IMusicVersionRepository } from '../../repositories/MusicVersionRepository.js';
import type { TUserId, TMusicVersionId, TUpdateMusicVersionPayload, TMusicVersionDomainModel } from '@sh3pherd/shared-types';
import { MusicVersionEntity } from '../../domain/entities/MusicVersionEntity.js';
import { RecordMetadataUtils } from '../../../utils/metaData/RecordMetadataUtils.js';

export class UpdateMusicVersionCommand {
  constructor(
    public readonly actorId: TUserId,
    public readonly versionId: TMusicVersionId,
    public readonly patch: TUpdateMusicVersionPayload,
  ) {}
}

@CommandHandler(UpdateMusicVersionCommand)
export class UpdateMusicVersionHandler implements ICommandHandler<UpdateMusicVersionCommand, TMusicVersionDomainModel> {
  constructor(
    @Inject(MUSIC_VERSION_REPO) private readonly versionRepo: IMusicVersionRepository,
  ) {}

  async execute(cmd: UpdateMusicVersionCommand): Promise<TMusicVersionDomainModel> {
    const existing = await this.versionRepo.findOneByVersionId(cmd.versionId);

    if (!existing) {
      throw new Error('MUSIC_VERSION_NOT_FOUND');
    }

    const version = new MusicVersionEntity(existing);
    version.ensureOwnedBy(cmd.actorId);

    const updated = await this.versionRepo.updateVersion(cmd.versionId, {
      ...cmd.patch,
      ...RecordMetadataUtils.patchUpdate(),
    });

    if (!updated) {
      throw new Error('MUSIC_VERSION_UPDATE_FAILED');
    }
    return updated;
  }
}
