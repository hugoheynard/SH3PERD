import { QueryHandler, type IQueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import type { TContractListItemViewModel, TUserId } from '@sh3pherd/shared-types';
import { CONTRACT_READ_REPO } from '../../../appBootstrap/nestTokens.js';
import type { IContractReadRepository } from '../../repositories/ContractReadRepository.js';

export class GetCurrentUserContractsQuery {
  constructor(public readonly userId: TUserId) {}
}

@QueryHandler(GetCurrentUserContractsQuery)
export class GetCurrentUserContractsHandler implements IQueryHandler<GetCurrentUserContractsQuery, TContractListItemViewModel[]> {
  constructor(
    @Inject(CONTRACT_READ_REPO) private readonly readRepo: IContractReadRepository,
  ) {}

  async execute(query: GetCurrentUserContractsQuery): Promise<TContractListItemViewModel[]> {
    return this.readRepo.getContractListViewModel(query.userId) ?? [];
  }
}
