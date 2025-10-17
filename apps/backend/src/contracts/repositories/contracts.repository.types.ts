import type {
  TUserId,
  TContractId,
  TContractRecord,
} from '@sh3pherd/shared-types';

import type { IBaseCRUD } from '../../utils/repoAdaptersHelpers/repository.genericFunctions.types.js';
import type { TBaseMongoRepoDeps } from '../../utils/repoAdaptersHelpers/BaseMongoRepository.js';

export type TContractMongoRepositoryDeps = TBaseMongoRepoDeps;



export interface IContractRepository extends IBaseCRUD<TContractRecord>{
  markContractAsFavorite: (input: {
    contract_id: TContractId;
    user_id: TUserId;
  }) => Promise<TContractRecord | null>;
}


export type TCreateContractFn = IContractRepository['save'];
export type TMarkContractAsFavoriteFn = IContractRepository['markContractAsFavorite'];
