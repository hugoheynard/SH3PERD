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
    // For every nullable field: `null` clears, `undefined` leaves it.
    if (cmd.payload.totalDurationTargetSeconds !== undefined) {
      aggregate.setTotalDurationTarget(
        cmd.actorId,
        cmd.payload.totalDurationTargetSeconds ?? undefined,
      );
    }
    if (cmd.payload.totalTrackCountTarget !== undefined) {
      aggregate.setTotalTrackCountTarget(
        cmd.actorId,
        cmd.payload.totalTrackCountTarget ?? undefined,
      );
    }
    if (cmd.payload.startAt !== undefined) {
      aggregate.setShowStartAt(cmd.actorId, cmd.payload.startAt ?? undefined);
    }
    if (cmd.payload.axisCriteria !== undefined) {
      aggregate.setShowAxisCriteria(cmd.actorId, cmd.payload.axisCriteria ?? undefined);
    }
    await this.aggregateRepo.save(aggregate);
    return aggregate.showEntity.toDomain;
  }
}
