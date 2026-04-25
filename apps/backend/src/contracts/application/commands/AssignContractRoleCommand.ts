import { CommandHandler, type ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import type { TContractId, TContractRecord, TUserId } from '@sh3pherd/shared-types';
import type { TContractRole } from '@sh3pherd/shared-types';
import { CONTRACT_REPO } from '../../../appBootstrap/nestTokens.js';
import type { IContractRepository } from '../../repositories/ContractMongoRepository.js';
import { ContractEntity } from '../../domain/ContractEntity.js';
import { ContractPolicy } from '../../domain/ContractPolicy.js';
import { RecordMetadataUtils } from '../../../utils/metaData/RecordMetadataUtils.js';
import { BusinessError } from '../../../utils/errorManagement/BusinessError.js';
import type { Filter, UpdateFilter } from 'mongodb';

export class AssignContractRoleCommand {
  constructor(
    public readonly contractId: TContractId,
    public readonly role: TContractRole,
    public readonly actorId: TUserId,
  ) {}
}

@CommandHandler(AssignContractRoleCommand)
export class AssignContractRoleHandler implements ICommandHandler<
  AssignContractRoleCommand,
  TContractRecord
> {
  constructor(@Inject(CONTRACT_REPO) private readonly contractRepo: IContractRepository) {}

  async execute(cmd: AssignContractRoleCommand): Promise<TContractRecord> {
    const record = await this.contractRepo.findOne({ filter: { id: cmd.contractId } });
    if (!record)
      throw new BusinessError('Contract not found', { code: 'CONTRACT_NOT_FOUND', status: 404 });

    const entity = new ContractEntity(record);
    ContractPolicy.ensureEditable(entity);
    entity.assignRole(cmd.role);

    const diff = entity.getDiffProps();
    if (Object.keys(diff).length === 0) return record;

    const filter: Filter<TContractRecord> = { id: cmd.contractId };
    const update: UpdateFilter<TContractRecord> = {
      $set: { ...diff, ...RecordMetadataUtils.update() },
    };
    const updated = await this.contractRepo.updateOne({ filter, update });

    if (!updated)
      throw new BusinessError('Failed to assign role', {
        code: 'CONTRACT_ROLE_ASSIGN_FAILED',
        status: 500,
      });
    return updated;
  }
}
