import type { TContractRecord,  TUserId, TContractDomainModel, TCompanyId, TCompanyRecord } from '@sh3pherd/shared-types';
import { RecordMetadataUtils } from '../../utils/metaData/RecordMetadataUtils.js';
import type { Filter } from 'mongodb';
import type { TFindManyMongoFn } from '../../utils/repoAdaptersHelpers/repository.genericFunctions.types.js';


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
  findContractsByFilterFn: TFindManyMongoFn<TContractRecord>;
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