import type { TContractDomainModel, TCreateContractRequestDTO } from '@sh3pherd/shared-types';
import { generateTypedId } from '../../utils/ids/generateTypedId.js';

/**
 * Builds a contract domain model from the provided input data.
 * @param input
 * @returns A TContractDomainModel object.
 */
export function buildContract(input: TCreateContractRequestDTO): TContractDomainModel {
  const { company_id, user_id, startDate, endDate } = input;

  return {
      contract_id: generateTypedId('contract'),
      company_id,
      user_id,
      startDate,
      endDate,
      status: 'draft',
    };
}