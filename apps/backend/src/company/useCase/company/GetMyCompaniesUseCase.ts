import { Inject, Injectable } from '@nestjs/common';
import type { TCompanyCardViewModel, TCompanyId, TUserId } from '@sh3pherd/shared-types';
import { COMPANY_REPO } from '../../company.tokens.js';
import type { ICompanyRepository } from '../../repositories/CompanyMongoRepository.js';

@Injectable()
export class GetMyCompaniesUseCase {
  constructor(
    @Inject(COMPANY_REPO) private readonly companyRepo: ICompanyRepository,
  ) {}

  async execute(actorId: TUserId): Promise<TCompanyCardViewModel[]> {
    const records = await this.companyRepo.findByMember(actorId);
    return records.map(r => ({
      id: r.id as TCompanyId,
      name: r.name,
      status: r.status,
      adminCount: (r.admins ?? []).length,
      createdAt: r.created_at,
    }));
  }
}
