import { QueryHandler, type IQueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import type { TCompanyCardViewModel, TUserId } from '@sh3pherd/shared-types';
import { COMPANY_REPO } from '../../company.tokens.js';
import type { ICompanyRepository } from '../../repositories/CompanyMongoRepository.js';

export class GetMyCompaniesQuery {
  constructor(public readonly userId: TUserId) {}
}

/**
 * Returns all companies the user has access to via active contracts.
 * The repository handles the contract → company join internally.
 */
@QueryHandler(GetMyCompaniesQuery)
export class GetMyCompaniesHandler implements IQueryHandler<GetMyCompaniesQuery, TCompanyCardViewModel[]> {
  constructor(
    @Inject(COMPANY_REPO) private readonly companyRepo: ICompanyRepository,
  ) {}

  async execute(query: GetMyCompaniesQuery): Promise<TCompanyCardViewModel[]> {
    const companies = await this.companyRepo.findByUser(query.userId);

    return companies.map((c): TCompanyCardViewModel => ({
      id: c.id,
      name: c.name,
      status: c.status,
      createdAt: c.created_at ?? new Date(),
    }));
  }
}
