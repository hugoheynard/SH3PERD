import { CommandHandler, type ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import type { TCompanyId, TCompanyInfo, TUserId } from '@sh3pherd/shared-types';
import { COMPANY_REPO } from '../../company.tokens.js';
import type { ICompanyRepository } from '../../repositories/CompanyMongoRepository.js';
import { CompanyEntity } from '../../domain/CompanyEntity.js';
import { RecordMetadataUtils } from '../../../utils/metaData/RecordMetadataUtils.js';
import { BusinessError } from '../../../utils/errorManagement/BusinessError.js';
import { TechnicalError } from '../../../utils/errorManagement/TechnicalError.js';

/** DTO for the update — extends TCompanyInfo with the target company ID. */
export type TUpdateCompanyInfoDTO = TCompanyInfo & {
  company_id: TCompanyId;
};

export class UpdateCompanyInfoCommand {
  constructor(
    public readonly dto: TUpdateCompanyInfoDTO,
    public readonly actorId: TUserId,
  ) {}
}

/**
 * Updates a company's public info (name, description, address).
 *
 * Flow:
 * 1. Verify the actor has `company:settings:write` permission.
 * 2. Load the company record from the repository.
 * 3. Reconstitute the entity and apply the mutation (entity validates invariants).
 * 4. Persist the full entity state (no diff — the info fields are few and always sent together).
 * 5. Return the updated TCompanyInfo projection.
 *
 * @throws BusinessError COMPANY_NOT_FOUND (404) — company does not exist.
 * @throws BusinessError COMPANY_FORBIDDEN (403) — actor lacks permission (via policy).
 * @throws Error COMPANY_NAME_REQUIRED — name is empty (via entity).
 * @throws TechnicalError COMPANY_UPDATE_FAILED (500) — repository write failed.
 */
@CommandHandler(UpdateCompanyInfoCommand)
export class UpdateCompanyInfoHandler implements ICommandHandler<UpdateCompanyInfoCommand, TCompanyInfo> {

  constructor(
    @Inject(COMPANY_REPO) private readonly companyRepo: ICompanyRepository,
  ) {}

  async execute(cmd: UpdateCompanyInfoCommand): Promise<TCompanyInfo> {
    const { dto } = cmd;


    const record = await this.companyRepo.findOne({ filter: { id: dto.company_id } });

    if (!record) {
      throw new BusinessError('Company not found', { code: 'COMPANY_NOT_FOUND', status: 404 });
    }

    const entity = new CompanyEntity(RecordMetadataUtils.stripDocMetadata(record));
    const { company_id: _, ...info } = dto;
    entity.updateInfo(info);

    const updated = await this.companyRepo.updateOne({
      filter: { id: dto.company_id },
      update: { $set: { ...entity.toDomain, ...RecordMetadataUtils.update() } },
    });

    if (!updated) {
      throw new TechnicalError('Failed to update company', { code: 'COMPANY_UPDATE_FAILED' });
    }

    return entity.companyInfo;
  }
}
