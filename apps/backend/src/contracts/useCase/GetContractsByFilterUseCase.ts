import type { TContractRecord,  TUserId, TContractDomainModel } from '@sh3pherd/shared-types';
import { RecordMetadataUtils } from '../../utils/metaData/RecordMetadataUtils.js';
import type { Filter } from 'mongodb';
import { Inject } from '@nestjs/common';
import type { IContractRepository } from '../repositories/contracts.repository.types.js';
import { CONTRACT_REPO } from '../../appBootstrap/nestTokens.js';


export type TContractViewDetails = {
  viewDetails: {
    user: { firstname: string; lastname: string;};
    company: { name: string; };
  }
}

export type TContractViewModel = TContractDomainModel & TContractViewDetails;

export type TGetContractsByFilterUseCase = (input: {
  asker_id: TUserId;
  filter: Filter<TContractRecord>;
}) => Promise<TContractDomainModel[]>;


@Injectable()
export class GetContractsByFilterUseCase {
  constructor(
    @Inject(CONTRACT_REPO) private readonly contractRepo: IContractRepository,
  ) {};

  async execute(requestDTO: any): any {
    const { filter , asker_id } = input;

    //Add permissions here
    if (!asker_id ) {
      throw new Error('Unauthorized: asker_id is required');
    }

    const contractRecordResult  = await this.contractRepo.findMany({ ...filter }) ?? [];


    return RecordMetadataUtils.stripDocArrayMetadata(contractRecordResult) satisfies TContractDomainModel[];
  }
}