import { Inject, Injectable } from '@nestjs/common';
import { DomainError } from '../../../utils/errorManagement/errorClasses/DomainError.js';
import { RecordMetadataUtils } from '../../../utils/metaData/RecordMetadataUtils.js';
import type { TCompanyRecord, TCompanyId, TUserId } from '@sh3pherd/shared-types';
import { COMPANY_REPO } from '../../company.tokens.js';
import type { ICompanyRepository } from '../../repositories/CompanyMongoRepository.js';
import { CompanyEntity } from '../../domain/CompanyEntity.js';

export type TAddServiceDTO = {
  company_id: TCompanyId;
  name: string;
};

@Injectable()
export class AddServiceUseCase {
  constructor(
    @Inject(COMPANY_REPO) private readonly companyRepo: ICompanyRepository,
  ) {}

  async execute(dto: TAddServiceDTO, actorId: TUserId): Promise<TCompanyRecord> {
    const record = await this.companyRepo.findById(dto.company_id);
    console.log(actorId);
    if (!record) {
      throw new DomainError('Company not found', { code: 'COMPANY_NOT_FOUND', context: { companyId: dto.company_id } });
    }

    const entity = new CompanyEntity(record);
    entity.addService(dto.name);

    const patchMeta = RecordMetadataUtils.update();
    const updatedRecord: TCompanyRecord = { ...record, ...entity.toDomain, ...patchMeta };

    await this.companyRepo.updateOne({
      filter: { id: dto.company_id } as any,
      update: { $set: { services: updatedRecord.services, updated_at: patchMeta.updated_at } } as any,
    });

    return updatedRecord;
  }
}
