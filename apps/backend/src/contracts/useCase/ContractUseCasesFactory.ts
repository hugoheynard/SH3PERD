import { CreateContractUseCase, type TCreateContractUseCase } from './CreateContractUseCase.js';
import { GetCurrentUserContractList, type TGetContractsByFilterUseCase } from './GetCurrentUserContracts.useCase.js';
import { CREATE_CONTRACT_USE_CASE, GET_CONTRACTS_BY_FILTER_USE_CASE } from '../contracts.tokens.js';
import { Inject, Injectable } from '@nestjs/common';


export type TContractsUseCases = {
  create: TCreateContractUseCase;
  getCurrentUserContractList: TGetContractsByFilterUseCase;
};


@Injectable()
export class ContractsUseCaseFactory {
  constructor(
    @Inject(CREATE_CONTRACT_USE_CASE) private readonly createContract: CreateContractUseCase,
    @Inject(GET_CONTRACTS_BY_FILTER_USE_CASE) private readonly getByFilter: GetCurrentUserContractList
  ) {};


  create(): TContractsUseCases {
    return {
      create: (dto, context) =>this.createContract.execute(dto, context),
      getCurrentUserContractList: (input) =>this.getByFilter.execute(input),
    }
  };
}