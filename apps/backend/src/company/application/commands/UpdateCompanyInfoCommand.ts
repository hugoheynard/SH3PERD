import { CommandHandler, type ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import type { TCompanyAddress, TCompanyChannel, TCompanyId, TCompanyIntegration, TCompanyRecord, TUserId } from '@sh3pherd/shared-types';
import { COMPANY_REPO } from '../../company.tokens.js';
import type { ICompanyRepository } from '../../repositories/CompanyMongoRepository.js';
import { CompanyEntity } from '../../domain/CompanyEntity.js';
import { RecordMetadataUtils } from '../../../utils/metaData/RecordMetadataUtils.js';
import { BusinessError } from '../../../utils/errorManagement/errorClasses/BusinessError.js';
import { PermissionResolver } from '../../../permissions/PermissionResolver.js';

export type TUpdateCompanyInfoDTO = {
  company_id: TCompanyId;
  name?: string;
  description?: string;
  address?: TCompanyAddress;
  orgLayers?: string[];
  integrations?: TCompanyIntegration[];
  channels?: TCompanyChannel[];
};

export class UpdateCompanyInfoCommand {
  constructor(
    public readonly dto: TUpdateCompanyInfoDTO,
    public readonly actorId: TUserId,
  ) {}
}

/**
 * Updates company info (name, description, address).
 * Requires `company:settings:write` permission.
 */
@CommandHandler(UpdateCompanyInfoCommand)
export class UpdateCompanyInfoHandler implements ICommandHandler<UpdateCompanyInfoCommand, TCompanyRecord> {
  constructor(
    @Inject(COMPANY_REPO) private readonly companyRepo: ICompanyRepository,
    private readonly permissionResolver: PermissionResolver,
  ) {}

  async execute(cmd: UpdateCompanyInfoCommand): Promise<TCompanyRecord> {
    const { dto, actorId } = cmd;

    const canWrite = await this.permissionResolver.hasCompanyPermission(actorId, dto.company_id, 'company:settings:write');
    if (!canWrite) throw new BusinessError('Forbidden', 'COMPANY_FORBIDDEN', 403);

    const record = await this.companyRepo.findOne({ filter: { id: dto.company_id } });
    if (!record) throw new BusinessError('Company not found', 'COMPANY_NOT_FOUND', 404);

    const entity = new CompanyEntity(record);
    entity.updateInfo({ name: dto.name, description: dto.description, address: dto.address });
    if (dto.orgLayers) entity.updateOrgLayers(dto.orgLayers);
    if (dto.integrations !== undefined) entity.updateIntegrations(dto.integrations);
    if (dto.channels !== undefined) entity.updateChannels(dto.channels);

    const diff = entity.getDiffProps();
    if (Object.keys(diff).length === 0) return record;

    const updated = await this.companyRepo.updateOne({
      filter: { id: dto.company_id } as any,
      update: { $set: { ...diff, ...RecordMetadataUtils.update() } } as any,
    });

    if (!updated) throw new BusinessError('Failed to update company', 'COMPANY_UPDATE_FAILED', 500);
    return updated;
  }
}
