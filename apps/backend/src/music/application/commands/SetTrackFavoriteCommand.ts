import { CommandHandler, type ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { REPERTOIRE_ENTRY_AGGREGATE_REPO } from '../../../appBootstrap/nestTokens.js';
import type { IRepertoireEntryAggregateRepository } from '../../repositories/RepertoireEntryAggregateRepository.js';
import type { TUserId, TMusicVersionId, TVersionTrackId } from '@sh3pherd/shared-types';
import { BusinessError } from '../../../utils/errorManagement/BusinessError.js';
import { MusicApiCodes } from '../../codes.js';

export class SetTrackFavoriteCommand {
  constructor(
    public readonly actorId: TUserId,
    public readonly versionId: TMusicVersionId,
    public readonly trackId: TVersionTrackId,
  ) {}
}

@CommandHandler(SetTrackFavoriteCommand)
export class SetTrackFavoriteHandler implements ICommandHandler<SetTrackFavoriteCommand, boolean> {
  constructor(
    @Inject(REPERTOIRE_ENTRY_AGGREGATE_REPO)
    private readonly aggregateRepo: IRepertoireEntryAggregateRepository,
  ) {}

  async execute(cmd: SetTrackFavoriteCommand): Promise<boolean> {
    const aggregate = await this.aggregateRepo.loadByVersionId(cmd.versionId);
    if (!aggregate) {
      throw new BusinessError(MusicApiCodes.MUSIC_VERSION_NOT_FOUND.code, {
        code: MusicApiCodes.MUSIC_VERSION_NOT_FOUND.code,
        status: 404,
      });
    }
    aggregate.setFavoriteTrack(cmd.actorId, cmd.versionId, cmd.trackId);
    await this.aggregateRepo.save(aggregate);
    return true;
  }
}
