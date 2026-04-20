import { CommandHandler, type ICommandHandler } from '@nestjs/cqrs';
import { Injectable } from '@nestjs/common';
import { ShowAggregateRepository } from '../../repositories/ShowAggregateRepository.js';
import type {
  TShowDomainModel,
  TShowId,
  TUpdateShowPayload,
  TUserId,
} from '@sh3pherd/shared-types';

export class UpdateShowInfoCommand {
  constructor(
    public readonly actorId: TUserId,
    public readonly showId: TShowId,
    public readonly payload: TUpdateShowPayload,
  ) {}
}

@CommandHandler(UpdateShowInfoCommand)
@Injectable()
export class UpdateShowInfoHandler implements ICommandHandler<
  UpdateShowInfoCommand,
  TShowDomainModel
> {
  constructor(private readonly aggregateRepo: ShowAggregateRepository) {}

  async execute(cmd: UpdateShowInfoCommand): Promise<TShowDomainModel> {
    const aggregate = await this.aggregateRepo.findById(cmd.showId);
    if (!aggregate) throw new Error('SHOW_NOT_FOUND');

    if (cmd.payload.name !== undefined) aggregate.rename(cmd.actorId, cmd.payload.name);
    if (cmd.payload.color !== undefined) aggregate.changeColor(cmd.actorId, cmd.payload.color);
    if (cmd.payload.description !== undefined) {
      aggregate.updateDescription(cmd.actorId, cmd.payload.description);
    }
    await this.aggregateRepo.save(aggregate);
    return aggregate.showEntity.toDomain;
  }
}
