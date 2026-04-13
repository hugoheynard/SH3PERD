import { CommandHandler, type ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { TCompanyStatus } from '@sh3pherd/shared-types';
import type { TCompanyDomainModel, TContractDomainModel, TUserId } from '@sh3pherd/shared-types';
import { COMPANY_REPO } from '../../company.tokens.js';
import { CONTRACT_REPO } from '../../../appBootstrap/nestTokens.js';
import type { ICompanyRepository } from '../../repositories/CompanyMongoRepository.js';
import type { IContractRepository } from '../../../contracts/repositories/ContractMongoRepository.js';
import { TransactionRunner } from '../../../appBootstrap/database/TransactionRunner.js';
import { CompanyEntity } from '../../domain/CompanyEntity.js';
import { ContractEntity } from '../../../contracts/domain/ContractEntity.js';
import { RecordMetadataUtils } from '../../../utils/metaData/RecordMetadataUtils.js';
import { TechnicalError } from '../../../utils/errorManagement/TechnicalError.js';

export type TCreateCompanyDTO = { name: string };

/** Return type — both created domain objects. */
export type TCreateCompanyResult = {
  company: TCompanyDomainModel;
  ownerContract: TContractDomainModel;
};

export class CreateCompanyCommand {
  constructor(
    public readonly dto: TCreateCompanyDTO,
    public readonly actorId: TUserId,
  ) {}
}

/**
 * Creates a company and its owner contract in a single atomic transaction.
 *
 * ⚠️ CRITICAL COUPLING: The owner contract is created synchronously within the same
 * transaction as the company. This is intentional — a company without an owner contract
 * is an invalid state. The owner contract is the only way for the creator to access
 * the company (permissions are resolved from contracts).
 *
 * This is NOT a candidate for event-driven decoupling. If the contract creation were
 * async via an event bus and failed, the company would exist without any accessible user,
 * requiring a saga or manual cleanup.
 *
 * Flow:
 * 1. Validate company name and create CompanyEntity (entity validates invariants).
 * 2. Create ContractEntity with role 'owner'.
 * 3. Run both inserts in a MongoDB transaction — if either fails, both are rolled back.
 * 4. Return both domain models.
 *
 * @throws Error COMPANY_NAME_REQUIRED — name is empty (via entity).
 * @throws TechnicalError COMPANY_CREATE_FAILED (500) — transaction failed.
 */
@CommandHandler(CreateCompanyCommand)
export class CreateCompanyHandler implements ICommandHandler<
  CreateCompanyCommand,
  TCreateCompanyResult
> {
  constructor(
    @Inject(COMPANY_REPO) private readonly companyRepo: ICompanyRepository,
    @Inject(CONTRACT_REPO) private readonly contractRepo: IContractRepository,
    private readonly transaction: TransactionRunner,
  ) {}

  async execute(cmd: CreateCompanyCommand): Promise<TCreateCompanyResult> {
    const { dto, actorId } = cmd;

    // 1. Build entities (validates invariants before touching the DB)
    const company = new CompanyEntity({
      name: dto.name,
      owner_id: actorId,
      description: '',
      address: { street: '', city: '', zip: '', country: '' },
      orgLayers: [...CompanyEntity.DEFAULT_ORG_LAYERS],
      status: TCompanyStatus.ACTIVE,
    });

    const ownerContract = new ContractEntity({
      user_id: actorId,
      company_id: company.id,
      roles: ['owner'],
      status: 'active',
      startDate: new Date(),
    });

    // 2. Atomic transaction — both succeed or both rollback
    const metadata = RecordMetadataUtils.create(actorId);

    try {
      await this.transaction.run(async (session) => {
        await this.companyRepo.save({ ...company.toDomain, ...metadata } as any, session);
        await this.contractRepo.save({ ...ownerContract.toDomain, ...metadata } as any, session);
      });
    } catch {
      throw new TechnicalError('Failed to create company', { code: 'COMPANY_CREATE_FAILED' });
    }

    return {
      company: company.toDomain,
      ownerContract: ownerContract.toDomain,
    };
  }
}
