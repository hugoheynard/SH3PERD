import { QueryHandler, type IQueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import type { TCompanyId, TCompanyRecord } from '@sh3pherd/shared-types';
import { COMPANY_REPO } from '../../company.tokens.js';
import type { ICompanyRepository } from '../../repositories/CompanyMongoRepository.js';

export class GetCompanyByIdQuery {
  constructor(public readonly companyId: TCompanyId) {}
}

@QueryHandler(GetCompanyByIdQuery)
export class GetCompanyByIdHandler implements IQueryHandler<GetCompanyByIdQuery, TCompanyRecord | null> {
  constructor(
    @Inject(COMPANY_REPO) private readonly companyRepo: ICompanyRepository,
  ) {}

  async execute(query: GetCompanyByIdQuery): Promise<TCompanyRecord | null> {
    return this.companyRepo.findOne({ filter: { id: query.companyId } });
  }
}
