import { Inject, Injectable } from '@nestjs/common';
import { RecordMetadataUtils } from '../../../utils/metaData/RecordMetadataUtils.js';
import { TechnicalError } from '../../../utils/errorManagement/errorClasses/TechnicalError.js';
import type { TCompanyRecord, TUserId } from '@sh3pherd/shared-types';
import { COMPANY_REPO } from '../../company.tokens.js';
import type { ICompanyRepository } from '../../repositories/CompanyMongoRepository.js';
import { CompanyEntity } from '../../domain/CompanyEntity.js';

export type TCreateCompanyDTO = { name: string };

@Injectable()
export class CreateCompanyUseCase {
  constructor(
    @Inject(COMPANY_REPO) private readonly companyRepo: ICompanyRepository,
  ) {}

  async execute(dto: TCreateCompanyDTO, actorId: TUserId): Promise<TCompanyRecord> {
    const entity = new CompanyEntity({ name: dto.name, owner_id: actorId, services: [], admins: [], status: 'active' });
    const metadata = RecordMetadataUtils.create(actorId);
    const record: TCompanyRecord = { ...entity.toDomain, ...metadata };

    const saved = await this.companyRepo.save(record);

    if (!saved) {
      throw new TechnicalError('Failed to create company', 'COMPANY_CREATE_FAILED', 500);
    }

    return record;
  }
}
