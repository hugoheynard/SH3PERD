import { Inject, Injectable } from '@nestjs/common';
import type { TCompanyId, TServiceId, TService } from '@sh3pherd/shared-types';
import { COMPANY_REPO } from '../../company.tokens.js';
import type { ICompanyRepository } from '../../repositories/CompanyMongoRepository.js';
import { CompanyEntity } from '../../domain/CompanyEntity.js';
import { TechnicalError } from '../../../utils/errorManagement/errorClasses/TechnicalError.js';

export type TUpdateServiceDTO = {
  company_id: TCompanyId;
  service_id: TServiceId;
  name?: string;
  color?: string;
};

@Injectable()
export class UpdateServiceUseCase {
  constructor(
    @Inject(COMPANY_REPO) private readonly companyRepo: ICompanyRepository,
  ) {}

  async execute(dto: TUpdateServiceDTO): Promise<TService> {
    const record = await this.companyRepo.findById(dto.company_id);
    if (!record) throw new TechnicalError('Company not found', 'COMPANY_NOT_FOUND', 404);

    const entity = CompanyEntity.fromRecord(record);
    const updated = entity.updateService(dto.service_id, { name: dto.name, color: dto.color });

    await this.companyRepo.updateOne({
      filter: { id: dto.company_id } as any,
      update: { $set: { services: entity.toDomain.services } },
    });

    return updated;
  }
}
