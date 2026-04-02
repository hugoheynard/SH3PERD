import { CommandHandler, type ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import type { TContractId, TContractRecord, TUserId } from '@sh3pherd/shared-types';
import type { TContractRole } from '@sh3pherd/shared-types';
import { CONTRACT_REPO } from '../../../appBootstrap/nestTokens.js';
import type { IContractRepository } from '../../repositories/ContractMongoRepository.js';
import { ContractEntity } from '../../domain/ContractEntity.js';
import { RecordMetadataUtils } from '../../../utils/metaData/RecordMetadataUtils.js';
import { BusinessError } from '../../../utils/errorManagement/errorClasses/BusinessError.js';

export class RemoveContractRoleCommand {
  constructor(
    public readonly contractId: TContractId,
    public readonly role: TContractRole,
    public readonly actorId: TUserId,
  ) {}
}

@CommandHandler(RemoveContractRoleCommand)
export class RemoveContractRoleHandler implements ICommandHandler<RemoveContractRoleCommand, TContractRecord> {
  constructor(
    @Inject(CONTRACT_REPO) private readonly contractRepo: IContractRepository,
  ) {}

  async execute(cmd: RemoveContractRoleCommand): Promise<TContractRecord> {
    const record = await this.contractRepo.findOne({ filter: { id: cmd.contractId } });
    if (!record) throw new BusinessError('Contract not found', 'CONTRACT_NOT_FOUND', 404);

    const entity = new ContractEntity(record);
    entity.removeRole(cmd.role); // throws if role not present

    const diff = entity.getDiffProps();

    const updated = await this.contractRepo.updateOne({
      filter: { id: cmd.contractId } as any,
      update: { $set: { ...diff, ...RecordMetadataUtils.update() } } as any,
    });

    if (!updated) throw new BusinessError('Failed to remove role', 'CONTRACT_ROLE_REMOVE_FAILED', 500);
    return updated;
  }
}
