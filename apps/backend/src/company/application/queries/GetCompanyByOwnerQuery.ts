import { QueryHandler, type IQueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import type { TCompanyRecord, TUserId } from '@sh3pherd/shared-types';
import { COMPANY_REPO } from '../../company.tokens.js';
import type { ICompanyRepository } from '../../repositories/CompanyMongoRepository.js';

export class GetCompanyByOwnerQuery {
  constructor(public readonly ownerId: TUserId) {}
}

@QueryHandler(GetCompanyByOwnerQuery)
export class GetCompanyByOwnerHandler implements IQueryHandler<GetCompanyByOwnerQuery, TCompanyRecord | null> {
  constructor(
    @Inject(COMPANY_REPO) private readonly companyRepo: ICompanyRepository,
  ) {}

  async execute(query: GetCompanyByOwnerQuery): Promise<TCompanyRecord | null> {
    return this.companyRepo.findByOwner(query.ownerId);
  }
}
