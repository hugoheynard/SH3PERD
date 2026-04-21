import { CommandHandler, type ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { REPERTOIRE_ENTRY_AGGREGATE_REPO } from '../../../appBootstrap/nestTokens.js';
import { TRACK_STORAGE_SERVICE } from '../../infra/storage/storage.tokens.js';
import type { IRepertoireEntryAggregateRepository } from '../../repositories/RepertoireEntryAggregateRepository.js';
import type { ITrackStorageService } from '../../infra/storage/ITrackStorageService.js';
import type { TUserId, TMusicVersionId, TVersionTrackId } from '@sh3pherd/shared-types';
import { BusinessError } from '../../../utils/errorManagement/BusinessError.js';
import { MusicApiCodes } from '../../codes.js';

export class DeleteTrackCommand {
  constructor(
    public readonly actorId: TUserId,
    public readonly versionId: TMusicVersionId,
    public readonly trackId: TVersionTrackId,
  ) {}
}

@CommandHandler(DeleteTrackCommand)
export class DeleteTrackHandler implements ICommandHandler<DeleteTrackCommand, boolean> {
  constructor(
    @Inject(REPERTOIRE_ENTRY_AGGREGATE_REPO)
    private readonly aggregateRepo: IRepertoireEntryAggregateRepository,
    @Inject(TRACK_STORAGE_SERVICE) private readonly storage: ITrackStorageService,
  ) {}

  async execute(cmd: DeleteTrackCommand): Promise<boolean> {
    const aggregate = await this.aggregateRepo.loadByVersionId(cmd.versionId);
    if (!aggregate) {
      throw new BusinessError(MusicApiCodes.MUSIC_VERSION_NOT_FOUND.code, {
        code: MusicApiCodes.MUSIC_VERSION_NOT_FOUND.code,
        status: 404,
      });
    }
    const track = aggregate.removeTrack(cmd.actorId, cmd.versionId, cmd.trackId);

    // Delete from S3 (best-effort)
    if (track.s3Key) {
      await this.storage.delete(track.s3Key).catch(() => {});
    }

    await this.aggregateRepo.save(aggregate);
    return true;
  }
}
