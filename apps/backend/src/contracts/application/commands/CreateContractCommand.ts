import { CommandHandler, type ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import type { TContractRecord, TCreateContractRequestDTO, TUserId } from '@sh3pherd/shared-types';
import { CONTRACT_REPO } from '../../../appBootstrap/nestTokens.js';
import type { IContractRepository } from '../../repositories/ContractMongoRepository.js';
import { ContractEntity } from '../../domain/ContractEntity.js';
import { RecordMetadataUtils } from '../../../utils/metaData/RecordMetadataUtils.js';
import { TechnicalError } from '../../../utils/errorManagement/TechnicalError.js';

export class CreateContractCommand {
  constructor(
    public readonly dto: TCreateContractRequestDTO,
    public readonly actorId: TUserId,
  ) {}
}

@CommandHandler(CreateContractCommand)
export class CreateContractHandler implements ICommandHandler<CreateContractCommand, TContractRecord> {
  constructor(
    @Inject(CONTRACT_REPO) private readonly contractRepo: IContractRepository,
  ) {}

  async execute(cmd: CreateContractCommand): Promise<TContractRecord> {
    const { dto, actorId } = cmd;

    const entity = new ContractEntity({
      ...dto,
      roles: dto.roles ?? [],
    });

    const metadata = RecordMetadataUtils.create(actorId);
    const record: TContractRecord = { ...entity.toDomain, ...metadata };

    const saved = await this.contractRepo.save(record);
    if (!saved) throw new TechnicalError('Failed to create contract', { code: 'CONTRACT_CREATE_FAILED' });

    return record;
  }
}
