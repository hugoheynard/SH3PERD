import { createContractUseCaseFactory, type TCreateContractUseCase } from './createContractUseCaseFactory.js';
import type { TUseCasesFactoryGeneric } from '../../types/useCases.generic.types.js';
import {
  getContractsByFilterUseCaseFactory,
  type TGetContractsByFilterUseCase,
} from './getContractsByFilterUseCaseFactory.js';

export type TContractsUseCases = {
  create: TCreateContractUseCase;
  getContractsByFilter: TGetContractsByFilterUseCase;
};


export const contractUseCasesFactory: TUseCasesFactoryGeneric<TContractsUseCases> = (deps) => {
  const { contractRepository } = deps.repositories;

  return {
    create: createContractUseCaseFactory({ saveContractFn: (x) => contractRepository.create(x)}),
    getContractsByFilter: getContractsByFilterUseCaseFactory({ findContractsByFilterFn: (filter) => contractRepository.findManyDocsBy(filter) }),
  };
}