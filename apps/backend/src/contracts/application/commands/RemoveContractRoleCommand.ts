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

export class RemoveContractRoleCommand {
  constructor(
    public readonly contractId: TContractId,
    public readonly role: TContractRole,
    public readonly actorId: TUserId,
  ) {}
}

@CommandHandler(RemoveContractRoleCommand)
export class RemoveContractRoleHandler implements ICommandHandler<
  RemoveContractRoleCommand,
  TContractRecord
> {
  constructor(@Inject(CONTRACT_REPO) private readonly contractRepo: IContractRepository) {}

  async execute(cmd: RemoveContractRoleCommand): Promise<TContractRecord> {
    const record = await this.contractRepo.findOne({ filter: { id: cmd.contractId } });
    if (!record)
      throw new BusinessError('Contract not found', { code: 'CONTRACT_NOT_FOUND', status: 404 });

    const entity = new ContractEntity(record);
    ContractPolicy.ensureEditable(entity);
    entity.removeRole(cmd.role); // throws if role not present

    const diff = entity.getDiffProps();

    const filter: Filter<TContractRecord> = { id: cmd.contractId };
    const update: UpdateFilter<TContractRecord> = {
      $set: { ...diff, ...RecordMetadataUtils.update() },
    };
    const updated = await this.contractRepo.updateOne({ filter, update });

    if (!updated)
      throw new BusinessError('Failed to remove role', {
        code: 'CONTRACT_ROLE_REMOVE_FAILED',
        status: 500,
      });
    return updated;
  }
}
