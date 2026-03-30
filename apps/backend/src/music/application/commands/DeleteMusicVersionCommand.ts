import { CommandHandler, type ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { MUSIC_VERSION_REPO } from '../../../appBootstrap/nestTokens.js';
import { TRACK_STORAGE_SERVICE } from '../../infra/storage/storage.tokens.js';
import type { IMusicVersionRepository } from '../../repositories/MusicVersionRepository.js';
import type { ITrackStorageService } from '../../infra/storage/ITrackStorageService.js';
import { buildTrackS3Key } from '../../infra/storage/ITrackStorageService.js';
import type { TUserId, TMusicVersionId } from '@sh3pherd/shared-types';
import { MusicVersionEntity } from '../../domain/entities/MusicVersionEntity.js';

export class DeleteMusicVersionCommand {
  constructor(
    public readonly actorId: TUserId,
    public readonly versionId: TMusicVersionId,
  ) {}
}

@CommandHandler(DeleteMusicVersionCommand)
export class DeleteMusicVersionHandler implements ICommandHandler<DeleteMusicVersionCommand, boolean> {
  constructor(
    @Inject(MUSIC_VERSION_REPO) private readonly versionRepo: IMusicVersionRepository,
    @Inject(TRACK_STORAGE_SERVICE) private readonly storage: ITrackStorageService,
  ) {}

  async execute(cmd: DeleteMusicVersionCommand): Promise<boolean> {
    const existing = await this.versionRepo.findOneByVersionId(cmd.versionId);
    if (!existing) throw new Error('MUSIC_VERSION_NOT_FOUND');

    const version = new MusicVersionEntity(existing);
    version.ensureOwnedBy(cmd.actorId);

    // Delete all tracks from S3
    for (const track of existing.tracks) {
      const key = buildTrackS3Key(cmd.actorId, cmd.versionId, track.id, track.fileName);
      await this.storage.delete(key).catch(() => {}); // Best-effort cleanup
    }

    return this.versionRepo.deleteOneByVersionId(cmd.versionId);
  }
}
