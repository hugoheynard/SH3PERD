import { CommandHandler, type ICommandHandler } from '@nestjs/cqrs';
import { Injectable } from '@nestjs/common';
import { ShowAggregateRepository } from '../../repositories/ShowAggregateRepository.js';
import type { TShowId, TUserId } from '@sh3pherd/shared-types';

export class DeleteShowCommand {
  constructor(
    public readonly actorId: TUserId,
    public readonly showId: TShowId,
  ) {}
}

@CommandHandler(DeleteShowCommand)
@Injectable()
export class DeleteShowHandler implements ICommandHandler<DeleteShowCommand, boolean> {
  constructor(private readonly aggregateRepo: ShowAggregateRepository) {}

  async execute(cmd: DeleteShowCommand): Promise<boolean> {
    const aggregate = await this.aggregateRepo.findById(cmd.showId);
    if (!aggregate) throw new Error('SHOW_NOT_FOUND');
    if (aggregate.owner_id !== cmd.actorId) throw new Error('SHOW_NOT_OWNED');
    await this.aggregateRepo.delete(cmd.showId);
    return true;
  }
}
