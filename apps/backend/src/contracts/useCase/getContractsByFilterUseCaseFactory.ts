import type { TContractRecord,  TUserId, TContractDomainModel, TCompanyId, TCompanyRecord } from '@sh3pherd/shared-types';
import type { TFindManyDocsByFilterFn } from '../../utils/repoAdaptersHelpers/BaseMongoRepository.js';
import { RecordMetadataUtils } from '../../utils/metaData/RecordMetadataUtils.js';
import type { Filter } from 'mongodb';


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


export const getContractsByFilterUseCaseFactory = (deps: {
  findContractsByFilterFn: TFindManyDocsByFilterFn<TContractRecord>;
  findCompanyByIdFn?: (company_id: TCompanyId) => Promise<TCompanyRecord>;
}): TGetContractsByFilterUseCase => {

  const { findContractsByFilterFn } = deps;

  return async (input) => {
    const { filter , asker_id } = input;

    //Add permissions here
    if (!asker_id ) {
      throw new Error('Unauthorized: asker_id is required');
    }

    const contractRecordResult  = await findContractsByFilterFn({ ...filter }) ?? [];


    return RecordMetadataUtils.stripDocArrayMetadata(contractRecordResult) satisfies TContractDomainModel[];
  };
}