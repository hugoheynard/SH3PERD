import { CommandHandler, type ICommandHandler } from '@nestjs/cqrs';
import { Injectable } from '@nestjs/common';
import { ShowAggregateRepository } from '../../repositories/ShowAggregateRepository.js';
import { QuotaService } from '../../../quota/QuotaService.js';
import type { TShowDomainModel, TShowId, TUserId } from '@sh3pherd/shared-types';

export class DuplicateShowCommand {
  constructor(
    public readonly actorId: TUserId,
    public readonly showId: TShowId,
  ) {}
}

@CommandHandler(DuplicateShowCommand)
@Injectable()
export class DuplicateShowHandler implements ICommandHandler<
  DuplicateShowCommand,
  TShowDomainModel
> {
  constructor(
    private readonly aggregateRepo: ShowAggregateRepository,
    private readonly quota: QuotaService,
  ) {}

  async execute(cmd: DuplicateShowCommand): Promise<TShowDomainModel> {
    // Duplication counts against the same monthly `show_count` — the
    // artist materialised a new show. Mirrors the create path.
    await this.quota.ensureAllowed(cmd.actorId, 'show_count');

    const source = await this.aggregateRepo.findById(cmd.showId);
    if (!source) throw new Error('SHOW_NOT_FOUND');

    const copy = source.duplicateFor(cmd.actorId);
    await this.aggregateRepo.save(copy);
    await this.quota.recordUsage(cmd.actorId, 'show_count');
    return copy.showEntity.toDomain;
  }
}
