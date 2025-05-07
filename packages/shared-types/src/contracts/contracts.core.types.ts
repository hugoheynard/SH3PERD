import type {TContractDomainModel, TContractId} from "./contracts.domain.types.js";
import type {TUserId} from "../user/index.js";
import type {TBaseMongoRepoDeps} from "../mongo/mongo.types.js";

export type TContractMongoRepositoryDeps = TBaseMongoRepoDeps

export type TMarkContractAsFavoriteFn = (input: { contract_id: TContractId, user_id: TUserId }) => Promise<TContractDomainModel | null>;
export type TUnmarkContractAsFavoriteFn = (input: { user_id: TUserId }) => Promise<boolean>;
export interface IContractRepository {
    markAsFavorite: TMarkContractAsFavoriteFn

}