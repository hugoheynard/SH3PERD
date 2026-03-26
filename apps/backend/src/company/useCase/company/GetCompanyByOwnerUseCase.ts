import { Inject, Injectable } from '@nestjs/common';
import type { TCompanyRecord, TUserId } from '@sh3pherd/shared-types';
import { COMPANY_REPO } from '../../company.tokens.js';
import type { ICompanyRepository } from '../../repositories/CompanyMongoRepository.js';

@Injectable()
export class GetCompanyByOwnerUseCase {
  constructor(
    @Inject(COMPANY_REPO) private readonly companyRepo: ICompanyRepository,
  ) {}

  async execute(actorId: TUserId): Promise<TCompanyRecord | null> {
    return this.companyRepo.findByOwner(actorId);
  }
}
