import { CommandHandler, type ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { REPERTOIRE_ENTRY_AGGREGATE_REPO } from '../../../appBootstrap/nestTokens.js';
import type { IRepertoireEntryAggregateRepository } from '../../repositories/RepertoireEntryAggregateRepository.js';
import type {
  TUserId,
  TMusicVersionId,
  TUpdateMusicVersionPayload,
  TMusicVersionDomainModel,
} from '@sh3pherd/shared-types';

export class UpdateMusicVersionCommand {
  constructor(
    public readonly actorId: TUserId,
    public readonly versionId: TMusicVersionId,
    public readonly patch: TUpdateMusicVersionPayload,
  ) {}
}

@CommandHandler(UpdateMusicVersionCommand)
export class UpdateMusicVersionHandler implements ICommandHandler<
  UpdateMusicVersionCommand,
  TMusicVersionDomainModel
> {
  constructor(
    @Inject(REPERTOIRE_ENTRY_AGGREGATE_REPO)
    private readonly aggregateRepo: IRepertoireEntryAggregateRepository,
  ) {}

  async execute(cmd: UpdateMusicVersionCommand): Promise<TMusicVersionDomainModel> {
    const aggregate = await this.aggregateRepo.loadByVersionId(cmd.versionId);
    aggregate.updateVersionMetadata(cmd.actorId, cmd.versionId, cmd.patch);
    await this.aggregateRepo.save(aggregate);

    const version = aggregate.findVersion(cmd.versionId);
    if (!version) throw new Error('MUSIC_VERSION_NOT_FOUND');
    return version.toDomain;
  }
}
