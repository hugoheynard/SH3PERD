import { Module } from '@nestjs/common';
import {
  CONTRACTS_USE_CASES,
  CONTRACTS_USE_CASES_FACTORY,
  CREATE_CONTRACT_USE_CASE,
  GET_CONTRACTS_BY_FILTER_USE_CASE,
  GET_COMPANY_CONTRACTS_USE_CASE,
} from '../contracts.tokens.js';
import { CreateContractUseCase } from './CreateContractUseCase.js';
import { ContractsUseCaseFactory } from './ContractUseCasesFactory.js';
import { GetCurrentUserContractList } from './GetCurrentUserContracts.useCase.js';
import { GetCompanyContractListUseCase } from './GetCompanyContractListUseCase.js';

@Module({
  imports: [],
  providers: [
    { provide: CONTRACTS_USE_CASES_FACTORY, useClass: ContractsUseCaseFactory },
    {
      provide: CONTRACTS_USE_CASES,
      useFactory: (factory: ContractsUseCaseFactory) => factory.create(),
      inject: [CONTRACTS_USE_CASES_FACTORY],
    },
    { provide: CREATE_CONTRACT_USE_CASE, useClass: CreateContractUseCase },
    { provide: GET_CONTRACTS_BY_FILTER_USE_CASE, useClass: GetCurrentUserContractList },
    { provide: GET_COMPANY_CONTRACTS_USE_CASE,   useClass: GetCompanyContractListUseCase },
  ],
  exports: [CONTRACTS_USE_CASES],
})
export class ContractsUseCasesModule {}
