import { CreateContractUseCase, type TCreateContractUseCase } from './CreateContractUseCase.js';
import { GetCurrentUserContractList, type TGetContractsByFilterUseCase } from './GetCurrentUserContracts.useCase.js';
import { GetCompanyContractListUseCase } from './GetCompanyContractListUseCase.js';
import { GetContractByIdUseCase } from './GetContractByIdUseCase.js';
import { UpdateContractUseCase } from './UpdateContractUseCase.js';
import {
  CREATE_CONTRACT_USE_CASE,
  GET_CONTRACTS_BY_FILTER_USE_CASE,
  GET_COMPANY_CONTRACTS_USE_CASE,
  GET_CONTRACT_BY_ID_USE_CASE,
  UPDATE_CONTRACT_USE_CASE,
} from '../contracts.tokens.js';
import { Inject, Injectable } from '@nestjs/common';
import type {
  TCompanyContractViewModel,
  TCompanyId,
  TContractDetailViewModel,
  TContractId,
  TContractRecord,
  TUpdateContractDTO,
} from '@sh3pherd/shared-types';

export type TContractsUseCases = {
  create:                     TCreateContractUseCase;
  getCurrentUserContractList: TGetContractsByFilterUseCase;
  getCompanyContracts:        (companyId: TCompanyId) => Promise<TCompanyContractViewModel[]>;
  getContractById:            (contractId: TContractId) => Promise<TContractDetailViewModel>;
  updateContract:             (dto: TUpdateContractDTO) => Promise<TContractRecord>;
};

@Injectable()
export class ContractsUseCaseFactory {
  constructor(
    @Inject(CREATE_CONTRACT_USE_CASE)          private readonly createContract:        CreateContractUseCase,
    @Inject(GET_CONTRACTS_BY_FILTER_USE_CASE)  private readonly getByFilter:           GetCurrentUserContractList,
    @Inject(GET_COMPANY_CONTRACTS_USE_CASE)    private readonly getCompanyContractsUC: GetCompanyContractListUseCase,
    @Inject(GET_CONTRACT_BY_ID_USE_CASE)       private readonly getByIdUC:             GetContractByIdUseCase,
    @Inject(UPDATE_CONTRACT_USE_CASE)          private readonly updateUC:              UpdateContractUseCase,
  ) {}

  create(): TContractsUseCases {
    return {
      create:                     (dto, context) => this.createContract.execute(dto, context),
      getCurrentUserContractList: (input) => this.getByFilter.execute(input),
      getCompanyContracts:        (companyId) => this.getCompanyContractsUC.execute(companyId),
      getContractById:            (contractId) => this.getByIdUC.execute(contractId),
      updateContract:             (dto) => this.updateUC.execute(dto),
    };
  }
}
