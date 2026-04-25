import { CommandHandler, type ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import type { Filter } from 'mongodb';
import type { TContractRecord, TCreateContractRequestDTO, TUserId } from '@sh3pherd/shared-types';
import { CONTRACT_REPO } from '../../../appBootstrap/nestTokens.js';
import type { IContractRepository } from '../../repositories/ContractMongoRepository.js';
import { ContractEntity } from '../../domain/ContractEntity.js';
import { RecordMetadataUtils } from '../../../utils/metaData/RecordMetadataUtils.js';
import { BusinessError } from '../../../utils/errorManagement/BusinessError.js';
import { TechnicalError } from '../../../utils/errorManagement/TechnicalError.js';

export class CreateContractCommand {
  constructor(
    public readonly dto: TCreateContractRequestDTO,
    public readonly actorId: TUserId,
  ) {}
}

@CommandHandler(CreateContractCommand)
export class CreateContractHandler implements ICommandHandler<
  CreateContractCommand,
  TContractRecord
> {
  constructor(@Inject(CONTRACT_REPO) private readonly contractRepo: IContractRepository) {}

  async execute(cmd: CreateContractCommand): Promise<TContractRecord> {
    const { dto, actorId } = cmd;

    // A user/company pair carries at most one open contract at a time —
    // multiple roles go on a single record (`roles` is an array). A
    // pre-existing draft or active contract is the source of truth and
    // any change to it goes through update or addendum, not a duplicate.
    const conflictFilter: Filter<TContractRecord> = {
      user_id: dto.user_id,
      company_id: dto.company_id,
      status: { $in: ['draft', 'active'] },
    };
    const conflict = await this.contractRepo.findOne({ filter: conflictFilter });
    if (conflict) {
      throw new BusinessError(
        `A non-terminated contract already exists for this user and company (${conflict.id})`,
        { code: 'CONTRACT_DUPLICATE_FOR_PAIR', status: 409 },
      );
    }

    const entity = new ContractEntity({
      ...dto,
      roles: dto.roles ?? [],
    });

    const metadata = RecordMetadataUtils.create(actorId);
    const record: TContractRecord = { ...entity.toDomain, ...metadata };

    const saved = await this.contractRepo.save(record);
    if (!saved)
      throw new TechnicalError('Failed to create contract', { code: 'CONTRACT_CREATE_FAILED' });

    return record;
  }
}
