import { CommandHandler, type ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { TCompanyStatus } from '@sh3pherd/shared-types';
import type { TCompanyRecord, TUserId } from '@sh3pherd/shared-types';
import { COMPANY_REPO } from '../../company.tokens.js';
import { CONTRACT_REPO } from '../../../appBootstrap/nestTokens.js';
import type { ICompanyRepository } from '../../repositories/CompanyMongoRepository.js';
import type { IContractRepository } from '../../../contracts/repositories/ContractMongoRepository.js';
import { CompanyEntity } from '../../domain/CompanyEntity.js';
import { ContractEntity } from '../../../contracts/domain/ContractEntity.js';
import { RecordMetadataUtils } from '../../../utils/metaData/RecordMetadataUtils.js';
import { TechnicalError } from '../../../utils/errorManagement/errorClasses/TechnicalError.js';

export type TCreateCompanyDTO = { name: string };

export class CreateCompanyCommand {
  constructor(
    public readonly dto: TCreateCompanyDTO,
    public readonly actorId: TUserId,
  ) {}
}

/**
 * Creates a company and automatically:
 * 1. Creates the company record (entity validates name + owner)
 * 2. Creates an "owner" contract linking the creator to the company
 */
@CommandHandler(CreateCompanyCommand)
export class CreateCompanyHandler implements ICommandHandler<CreateCompanyCommand, TCompanyRecord> {
  constructor(
    @Inject(COMPANY_REPO) private readonly companyRepo: ICompanyRepository,
    @Inject(CONTRACT_REPO) private readonly contractRepo: IContractRepository,
  ) {}

  async execute(cmd: CreateCompanyCommand): Promise<TCompanyRecord> {
    const { dto, actorId } = cmd;

    const company = new CompanyEntity({
      name: dto.name,
      owner_id: actorId,
      description: '',
      address: { street: '', city: '', zip: '', country: '' },
      orgLayers: [...CompanyEntity.DEFAULT_ORG_LAYERS],
      integrations: [],
      channels: [],
      status: TCompanyStatus.ACTIVE,
    });

    const metadata = RecordMetadataUtils.create(actorId);
    const companyRecord: TCompanyRecord = { ...company.toDomain, ...metadata };

    const saved = await this.companyRepo.save(companyRecord);
    if (!saved) {
      throw new TechnicalError('Failed to create company', 'COMPANY_CREATE_FAILED', 500);
    }

    // Auto-create owner contract
    const ownerContract = new ContractEntity({
      user_id: actorId,
      company_id: company.id,
      roles: ['owner'],
      status: 'active',
      startDate: new Date(),
    });

    await this.contractRepo.save({
      ...ownerContract.toDomain,
      ...RecordMetadataUtils.create(actorId),
    });

    return companyRecord;
  }
}
