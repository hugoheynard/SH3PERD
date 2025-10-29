import type { TContractListItemViewModel, TGetContractsByFilterRequestDTO } from '@sh3pherd/shared-types';
import { Inject, Injectable } from '@nestjs/common';
import { CONTRACT_READ_REPO } from '../../appBootstrap/nestTokens.js';
import type { TUseCaseInput } from '../../types/useCases.generic.types.js';
import type { ContractReadRepository } from '../repositories/ContractReadRepository.js';




export type TContractViewDetails = {
  viewDetails: {
    user: { firstname: string; lastname: string;};
    company: { name: string; };
  }
}

export type TContractViewModel = TContractListItemViewModel & TContractViewDetails;

export type TGetContractsByFilterUseCase = (input: TUseCaseInput<TGetContractsByFilterRequestDTO, 'unscoped'>) => Promise<TContractListItemViewModel[]>;


@Injectable()
export class GetCurrentUserContractList {
  constructor(
    @Inject(CONTRACT_READ_REPO) private readonly contractRepo: ContractReadRepository,
  ) {};

  async execute(input: TUseCaseInput<TGetContractsByFilterRequestDTO, 'unscoped'>): Promise<TContractListItemViewModel[]> {

    const { user_scope } = input.context;
    //const { filter } = input.requestDTO;

    //Add permissions here
    if (!user_scope ) {
      throw new Error('Unauthorized: asker_id is required');
    }

    const repoRes  = await this.contractRepo.getContractListViewModel(user_scope) ?? [];




    return repoRes;
  };
}