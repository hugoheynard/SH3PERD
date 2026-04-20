import { CommandHandler, type ICommandHandler } from '@nestjs/cqrs';
import { Injectable } from '@nestjs/common';
import { ShowAggregate } from '../../domain/ShowAggregate.js';
import { ShowAggregateRepository } from '../../repositories/ShowAggregateRepository.js';
import { QuotaService } from '../../../quota/QuotaService.js';
import type { TCreateShowPayload, TShowDomainModel, TUserId } from '@sh3pherd/shared-types';

export class CreateShowCommand {
  constructor(
    public readonly actorId: TUserId,
    public readonly payload: TCreateShowPayload,
  ) {}
}

@CommandHandler(CreateShowCommand)
@Injectable()
export class CreateShowHandler implements ICommandHandler<CreateShowCommand, TShowDomainModel> {
  constructor(
    private readonly aggregateRepo: ShowAggregateRepository,
    private readonly quota: QuotaService,
  ) {}

  async execute(cmd: CreateShowCommand): Promise<TShowDomainModel> {
    // Quota check before we touch Mongo. `show_count` is monthly on
    // artist_pro (35/month), unlimited on artist_max, 0 on artist_free
    // (which 403s at the permission guard first, but defence-in-depth).
    await this.quota.ensureAllowed(cmd.actorId, 'show_count');

    const aggregate = ShowAggregate.create({
      owner_id: cmd.actorId,
      name: cmd.payload.name,
      color: cmd.payload.color,
      description: cmd.payload.description,
    });
    await this.aggregateRepo.save(aggregate);
    await this.quota.recordUsage(cmd.actorId, 'show_count');
    return aggregate.showEntity.toDomain;
  }
}
