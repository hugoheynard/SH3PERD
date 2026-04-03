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

export interface TAddChannelDTO {
  name: string;
  platform: TCommunicationPlatform;
  url: string;
}

export class AddChannelCommand {
  constructor(
    public readonly companyId: TCompanyId,
    public readonly dto: TAddChannelDTO,
    public readonly actorId: TUserId,
  ) {}
}

/** Adds a channel to the company. Entity validates platform is connected and generates the ID. Requires `company:settings:write`. */
@CommandHandler(AddChannelCommand)
export class AddChannelHandler implements ICommandHandler<AddChannelCommand, TCompanyRecord> {
  private readonly policy = new CompanyPolicy();

  constructor(
    @Inject(COMPANY_REPO) private readonly companyRepo: ICompanyRepository,
    private readonly permissionResolver: PermissionResolver,
  ) {}

  async execute(cmd: AddChannelCommand): Promise<TCompanyRecord> {
    await this.policy.ensureCanManageSettings(cmd.actorId, cmd.companyId, this.permissionResolver);

    const record = await this.companyRepo.findOne({ filter: { id: cmd.companyId } });

    if (!record) {
      throw new BusinessError('Company not found', 'COMPANY_NOT_FOUND', 404);
    }

    const entity = new CompanyEntity(RecordMetadataUtils.stripDocMetadata(record));
    entity.addChannel(cmd.dto);

    const diff = entity.getDiffProps();
    const updated = await this.companyRepo.updateOne({
      filter: { id: cmd.companyId } as any,
      update: { $set: { ...diff, ...RecordMetadataUtils.update() } } as any,
    });
    if (!updated) {
      throw new BusinessError('Failed to add channel', 'COMPANY_UPDATE_FAILED', 500);
    }
    return updated;
  }
}
