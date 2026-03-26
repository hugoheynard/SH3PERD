import { Inject, Injectable } from '@nestjs/common';
import { TechnicalError } from '../../../utils/errorManagement/errorClasses/TechnicalError.js';
import type { TCompanyId, TUserId } from '@sh3pherd/shared-types';
import { COMPANY_REPO } from '../../company.tokens.js';
import type { ICompanyRepository } from '../../repositories/CompanyMongoRepository.js';

@Injectable()
export class DeleteCompanyUseCase {
  constructor(
    @Inject(COMPANY_REPO) private readonly companyRepo: ICompanyRepository,
  ) {}

  async execute(companyId: TCompanyId, actorId: TUserId): Promise<void> {
    const company = await this.companyRepo.findById(companyId);

    if (!company) {
      throw new TechnicalError('Company not found', 'COMPANY_NOT_FOUND', 404);
    }

    if (company.owner_id !== actorId) {
      throw new TechnicalError('Only the owner can delete a company', 'COMPANY_DELETE_FORBIDDEN', 403);
    }

    await this.companyRepo.deleteOne({ id: companyId } as any);
  }
}
