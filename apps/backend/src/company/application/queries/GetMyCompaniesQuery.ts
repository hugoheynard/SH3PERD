import { QueryHandler, type IQueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import type { TCompanyCardViewModel, TContractRecord, TUserId } from '@sh3pherd/shared-types';
import { COMPANY_REPO } from '../../company.tokens.js';
import { CONTRACT_REPO } from '../../../appBootstrap/nestTokens.js';
import type { ICompanyRepository } from '../../repositories/CompanyMongoRepository.js';
import type { IBaseCRUD } from '../../../utils/repoAdaptersHelpers/repository.genericFunctions.types.js';

export class GetMyCompaniesQuery {
  constructor(public readonly userId: TUserId) {}
}

/**
 * Returns all companies the user has access to via active contracts.
 * Replaces the old approach that queried company.admins[].
 */
@QueryHandler(GetMyCompaniesQuery)
export class GetMyCompaniesHandler implements IQueryHandler<GetMyCompaniesQuery, TCompanyCardViewModel[]> {
  constructor(
    @Inject(COMPANY_REPO) private readonly companyRepo: ICompanyRepository,
    @Inject(CONTRACT_REPO) private readonly contractRepo: IBaseCRUD<TContractRecord>,
  ) {}

  async execute(query: GetMyCompaniesQuery): Promise<TCompanyCardViewModel[]> {
    // Find all active contracts for this user
    const contracts = await this.contractRepo.findMany({
      filter: { user_id: query.userId, status: 'active' } as any,
    }) ?? [];

    if (contracts.length === 0) return [];

    // Get unique company IDs
    const companyIds = [...new Set(contracts.map(c => c.company_id))];

    // Fetch all companies
    const companies = await this.companyRepo.findMany({
      filter: { id: { $in: companyIds } } as any,
    }) ?? [];

    return companies.map((c): TCompanyCardViewModel => ({
      id: c.id,
      name: c.name,
      status: c.status,
      createdAt: (c as any).created_at ?? new Date(),
    }));
  }
}
