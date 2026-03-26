import { Inject, Injectable } from '@nestjs/common';
import { TechnicalError } from '../../../utils/errorManagement/errorClasses/TechnicalError.js';
import type { TCompanyAddress, TCompanyId, TCompanyRecord, TUserId } from '@sh3pherd/shared-types';
import { COMPANY_REPO } from '../../company.tokens.js';
import type { ICompanyRepository } from '../../repositories/CompanyMongoRepository.js';
import { CompanyEntity } from '../../domain/CompanyEntity.js';

export type TUpdateCompanyInfoDTO = {
  company_id: TCompanyId;
  name?: string;
  description?: string;
  address?: TCompanyAddress;
};

@Injectable()
export class UpdateCompanyInfoUseCase {
  constructor(
    @Inject(COMPANY_REPO) private readonly companyRepo: ICompanyRepository,
  ) {}

  async execute(dto: TUpdateCompanyInfoDTO, actorId: TUserId): Promise<TCompanyRecord> {
    const record = await this.companyRepo.findById(dto.company_id);
    if (!record) throw new TechnicalError('Company not found', 'COMPANY_NOT_FOUND', 404);
    if (record.owner_id !== actorId) throw new TechnicalError('Forbidden', 'COMPANY_FORBIDDEN', 403);

    const entity = new CompanyEntity(record);
    entity.updateInfo({ name: dto.name, description: dto.description, address: dto.address });

    const updated = await this.companyRepo.updateOne({
      filter: { id: dto.company_id } as any,
      update: { $set: { name: entity.toDomain.name, description: entity.toDomain.description, address: entity.toDomain.address, updated_at: new Date() } } as any,
    });

    if (!updated) throw new TechnicalError('Failed to update company', 'COMPANY_UPDATE_FAILED', 500);
    return updated;
  }
}
