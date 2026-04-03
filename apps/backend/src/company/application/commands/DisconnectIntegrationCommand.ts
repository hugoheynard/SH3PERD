import { CommandHandler, type ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import type { TCommunicationPlatform, TCompanyId, TCompanyRecord, TUserId } from '@sh3pherd/shared-types';
import { COMPANY_REPO } from '../../company.tokens.js';
import type { ICompanyRepository } from '../../repositories/CompanyMongoRepository.js';
import { CompanyEntity } from '../../domain/CompanyEntity.js';
import { CompanyPolicy } from '../../domain/CompanyPolicy.js';
import { RecordMetadataUtils } from '../../../utils/metaData/RecordMetadataUtils.js';
import { BusinessError } from '../../../utils/errorManagement/errorClasses/BusinessError.js';
import { PermissionResolver } from '../../../permissions/PermissionResolver.js';

export class DisconnectIntegrationCommand {
  constructor(
    public readonly companyId: TCompanyId,
    public readonly platform: TCommunicationPlatform,
    public readonly actorId: TUserId,
  ) {}
}

/** Disconnects a platform integration and removes all its channels. Requires `company:settings:write`. */
@CommandHandler(DisconnectIntegrationCommand)
export class DisconnectIntegrationHandler implements ICommandHandler<DisconnectIntegrationCommand, TCompanyRecord> {
  private readonly policy = new CompanyPolicy();

  constructor(
    @Inject(COMPANY_REPO) private readonly companyRepo: ICompanyRepository,
    private readonly permissionResolver: PermissionResolver,
  ) {}

  async execute(cmd: DisconnectIntegrationCommand): Promise<TCompanyRecord> {
    await this.policy.ensureCanManageSettings(cmd.actorId, cmd.companyId, this.permissionResolver);

    const record = await this.companyRepo.findOne({ filter: { id: cmd.companyId } });
    if (!record) throw new BusinessError('Company not found', 'COMPANY_NOT_FOUND', 404);

    const entity = new CompanyEntity(RecordMetadataUtils.stripDocMetadata(record));
    entity.disconnectIntegration(cmd.platform);

    const diff = entity.getDiffProps();
    const updated = await this.companyRepo.updateOne({
      filter: { id: cmd.companyId } as any,
      update: { $set: { ...diff, ...RecordMetadataUtils.update() } } as any,
    });
    if (!updated) throw new BusinessError('Failed to update company', 'COMPANY_UPDATE_FAILED', 500);
    return updated;
  }
}
