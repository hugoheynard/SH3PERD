import { QueryHandler, type IQueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import type { TCompanyContractViewModel, TCompanyId } from '@sh3pherd/shared-types';
import { CONTRACT_READ_REPO } from '../../../appBootstrap/nestTokens.js';
import type { IContractReadRepository } from '../../repositories/ContractReadRepository.js';

export class GetCompanyContractsQuery {
  constructor(public readonly companyId: TCompanyId) {}
}

@QueryHandler(GetCompanyContractsQuery)
export class GetCompanyContractsHandler implements IQueryHandler<
  GetCompanyContractsQuery,
  TCompanyContractViewModel[]
> {
  constructor(@Inject(CONTRACT_READ_REPO) private readonly readRepo: IContractReadRepository) {}

  async execute(query: GetCompanyContractsQuery): Promise<TCompanyContractViewModel[]> {
    return this.readRepo.getCompanyContractList(query.companyId);
  }
}
