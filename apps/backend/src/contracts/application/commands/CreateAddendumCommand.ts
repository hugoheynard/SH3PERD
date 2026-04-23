import { CommandHandler, type ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import type {
  TAddendumChanges,
  TAddendumId,
  TContractAddendumRecord,
  TContractId,
  TUserId,
} from '@sh3pherd/shared-types';
import { ADDENDUM_REPO, CONTRACT_REPO } from '../../../appBootstrap/nestTokens.js';
import type { IContractRepository } from '../../repositories/ContractMongoRepository.js';
import type { IAddendumRepository } from '../../repositories/AddendumMongoRepository.js';
import { ContractEntity } from '../../domain/ContractEntity.js';
import { RecordMetadataUtils } from '../../../utils/metaData/RecordMetadataUtils.js';
import { BusinessError } from '../../../utils/errorManagement/BusinessError.js';

export class CreateAddendumCommand {
  constructor(
    public readonly contractId: TContractId,
    public readonly actorId: TUserId,
    public readonly changes: TAddendumChanges,
    public readonly effectiveDate: Date,
    public readonly reason?: string,
  ) {}
}

@CommandHandler(CreateAddendumCommand)
export class CreateAddendumHandler implements ICommandHandler<
  CreateAddendumCommand,
  TContractAddendumRecord
> {
  constructor(
    @Inject(CONTRACT_REPO) private readonly contractRepo: IContractRepository,
    @Inject(ADDENDUM_REPO) private readonly addendumRepo: IAddendumRepository,
  ) {}

  async execute(cmd: CreateAddendumCommand): Promise<TContractAddendumRecord> {
    const contract = await this.contractRepo.findOne({ filter: { id: cmd.contractId } });
    if (!contract)
      throw new BusinessError('Contract not found', { code: 'CONTRACT_NOT_FOUND', status: 404 });

    const entity = new ContractEntity(contract);
    if (!entity.isLocked()) {
      throw new BusinessError('Addenda can only be created on a fully signed (active) contract', {
        code: 'CONTRACT_NOT_LOCKED',
        status: 409,
      });
    }

    if (cmd.changes.template === 'extend_trial' && !contract.trial_period_days) {
      throw new BusinessError('Contract has no trial period to extend', {
        code: 'ADDENDUM_NO_TRIAL',
        status: 422,
      });
    }

    const metadata = RecordMetadataUtils.create(cmd.actorId);
    const record: TContractAddendumRecord = {
      id: `addendum_${crypto.randomUUID()}` as TAddendumId,
      contract_id: cmd.contractId,
      status: 'draft',
      reason: cmd.reason,
      effectiveDate: cmd.effectiveDate,
      changes: cmd.changes,
      createdAt: new Date(),
      createdBy: cmd.actorId,
      ...metadata,
    };

    return this.addendumRepo.insert(record);
  }
}
