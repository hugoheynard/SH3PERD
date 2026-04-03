import { CommandHandler, type ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import type { TCompanyId, TCompanyInfo, TUserId } from '@sh3pherd/shared-types';
import { COMPANY_REPO } from '../../company.tokens.js';
import type { ICompanyRepository } from '../../repositories/CompanyMongoRepository.js';
import { CompanyEntity } from '../../domain/CompanyEntity.js';
import { CompanyPolicy } from '../../domain/CompanyPolicy.js';
import { RecordMetadataUtils } from '../../../utils/metaData/RecordMetadataUtils.js';
import { BusinessError } from '../../../utils/errorManagement/errorClasses/BusinessError.js';
import { PermissionResolver } from '../../../permissions/PermissionResolver.js';

export type TUpdateCompanyInfoDTO = TCompanyInfo & {
  company_id: TCompanyId;
};

export class UpdateCompanyInfoCommand {
  constructor(
    public readonly dto: TUpdateCompanyInfoDTO,
    public readonly actorId: TUserId,
  ) {}
}

/** Updates company info (name, description, address). Requires `company:settings:write`. */
@CommandHandler(UpdateCompanyInfoCommand)
export class UpdateCompanyInfoHandler implements ICommandHandler<UpdateCompanyInfoCommand, TCompanyInfo> {
  private readonly policy = new CompanyPolicy();

  constructor(
    @Inject(COMPANY_REPO) private readonly companyRepo: ICompanyRepository,
    private readonly permissionResolver: PermissionResolver,
  ) {}

  async execute(cmd: UpdateCompanyInfoCommand): Promise<TCompanyInfo> {
    const { dto, actorId } = cmd;

    await this.policy.ensureCanManageSettings(actorId, dto.company_id, this.permissionResolver);

    const record = await this.companyRepo.findOne({ filter: { id: dto.company_id } });
    if (!record) throw new BusinessError('Company not found', 'COMPANY_NOT_FOUND', 404);

    const entity = new CompanyEntity(RecordMetadataUtils.stripDocMetadata(record));
    const { company_id: _, ...info } = dto;
    entity.updateInfo(info);

    const diff = entity.getDiffProps();
    if (Object.keys(diff).length > 0) {
      const updated = await this.companyRepo.updateOne({
        filter: { id: dto.company_id } as any,
        update: { $set: { ...diff, ...RecordMetadataUtils.update() } } as any,
      });
      if (!updated) throw new BusinessError('Failed to update company', 'COMPANY_UPDATE_FAILED', 500);
    }

    return { name: entity.name, description: entity.description, address: entity.address };
  }
}
