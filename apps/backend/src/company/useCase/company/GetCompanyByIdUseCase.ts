import { Inject, Injectable } from '@nestjs/common';
import type { TCompanyRecord, TCompanyId } from '@sh3pherd/shared-types';
import { COMPANY_REPO } from '../../company.tokens.js';
import type { ICompanyRepository } from '../../repositories/CompanyMongoRepository.js';

@Injectable()
export class GetCompanyByIdUseCase {
  constructor(
    @Inject(COMPANY_REPO) private readonly companyRepo: ICompanyRepository,
  ) {}

  async execute(id: TCompanyId): Promise<TCompanyRecord | null> {
    return this.companyRepo.findById(id);
  }
}
