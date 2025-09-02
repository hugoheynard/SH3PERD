import type { TBaseMongoRepoDeps } from '../../types/mongo/mongo.types.js';
import type { TContractDomainModel, TContractId } from './contracts.domain.types.js';
import type { TUserId } from '@sh3pherd/shared-types';

export type TContractMongoRepositoryDeps = TBaseMongoRepoDeps;

export type TMarkContractAsFavoriteFn = (input: {
  contract_id: TContractId;
  user_id: TUserId;
}) => Promise<TContractDomainModel | null>;

export type IContractRepository = {
  markContractAsFavorite: TMarkContractAsFavoriteFn;
};
