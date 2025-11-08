import { RecordMetadataUtils } from '../../utils/metaData/RecordMetadataUtils.js';
import type { TContractRecord, TCreateContractRequestDTO, TUserId } from '@sh3pherd/shared-types';
import { TechnicalError } from '../../utils/errorManagement/errorClasses/TechnicalError.js';
import { Inject, Injectable } from '@nestjs/common';
import { CONTRACT_REPO } from '../../appBootstrap/nestTokens.js';
import { ContractEntity } from '../domain/ContractEntity.js';
import type { IContractRepository } from '../repositories/ContractMongoRepository.js';


export type TCreateContractUseCase = (inputDTO: TCreateContractRequestDTO, asker_id: TUserId) => Promise<TContractRecord>;


@Injectable()
export class CreateContractUseCase {
  constructor(
    @Inject(CONTRACT_REPO) private readonly contractRepo: IContractRepository,
  ) {}

  async execute(inputDTO: TCreateContractRequestDTO, asker_id: TUserId): Promise<TContractRecord> {


    const contractDomain = new ContractEntity(inputDTO).toDomain;
    const metadata = RecordMetadataUtils.create(asker_id);
    const record = { ...contractDomain, ...metadata }

    const insertResult = await this.contractRepo.save(record);

    if (!insertResult) {
      throw new TechnicalError('Failed to create contract', 'contract_creation_failed', 500);
    }
    return record;
  };
}