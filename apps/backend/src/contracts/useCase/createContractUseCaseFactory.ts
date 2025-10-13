import { buildContract } from '../core/buildContract.js';
import { RecordMetadataUtils } from '../../utils/metaData/RecordMetadataUtils.js';
import type { TContractRecord, TCreateContractRequestDTO, TUserId } from '@sh3pherd/shared-types';
import type { TCreateContractFn } from '../repositories/contracts.repository.types.js';
import { TechnicalError } from '../../utils/errorManagement/errorClasses/TechnicalError.js';


export type TCreateContractUseCase = (inputDTO: TCreateContractRequestDTO, asker_id: TUserId) => Promise<TContractRecord>;
export type TCreateContractUseCaseDeps = { saveContractFn: TCreateContractFn }
export type TCreateContractUseCaseFactory = (deps: TCreateContractUseCaseDeps) => TCreateContractUseCase;


/**
 * Factory for the "create contract" use case.
 * Injects persistence dependencies and returns a strongly typed use case.
 * @param deps - Dependencies for the use case.
 * @returns A function that creates a contract when called with input data and asker ID.
 */
export const createContractUseCaseFactory: TCreateContractUseCaseFactory = deps => {
  const { saveContractFn } = deps;

  return  async (inputDTO, asker_id) => {

    const contractDomain = buildContract(inputDTO);
    const metadata = RecordMetadataUtils.create(asker_id);
    const record = { ...contractDomain, ...metadata }

    const insertResult = await saveContractFn(record);

    if (!insertResult) {
      throw new TechnicalError('Failed to create contract', 'contract_creation_failed', 500);
    }
    return record;
  };
};