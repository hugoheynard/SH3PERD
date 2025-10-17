import { CreateContractUseCase, type TCreateContractUseCase } from './CreateContractUseCase.js';
import { GetContractsByFilterUseCase, type TGetContractsByFilterUseCase } from './GetContractsByFilterUseCase.js';
import { CREATE_CONTRACT_USE_CASE, GET_CONTRACTS_BY_FILTER_USE_CASE } from '../contracts.tokens.js';
import { Inject, Injectable } from '@nestjs/common';


export type TContractsUseCases = {
  create: TCreateContractUseCase;
  getByFilter: TGetContractsByFilterUseCase;
};


@Injectable()
export class ContractsUseCaseFactory {
  constructor(
    @Inject(CREATE_CONTRACT_USE_CASE) private readonly createContract: CreateContractUseCase,
    @Inject(GET_CONTRACTS_BY_FILTER_USE_CASE) private readonly getByFilter: GetContractsByFilterUseCase
  ) {};


  create(): TContractsUseCases {
    return {
      create: (dto, asker_id) =>this.createContract.execute(dto, asker_id),
      getByFilter: (dto) =>this.getByFilter.execute(dto),
    }
  }
}