import type {TContractDomainModel, TContractId} from "./contracts.domain.types.js";
import type {TUserId} from "../user/index.js";
import type {TMarkContractAsFavoriteFn, TUnmarkContractAsFavoriteFn} from "./contracts.core.types.js";

export type TMarkAsFavoriteUseCaseDeps = {
    unmarkContractAsFavoriteFn: TUnmarkContractAsFavoriteFn;
    markContractAsFavoriteFn: TMarkContractAsFavoriteFn;
}

export type TMarkAsFavoriteUseCase = (input: { contract_id: TContractId; user_id: TUserId }) => Promise<TContractDomainModel>;