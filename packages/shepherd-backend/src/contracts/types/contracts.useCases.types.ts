import type {TContractDomainModel, TContractId} from "./contracts.domain.types.js";

import type {TMarkContractAsFavoriteFn } from "./contracts.core.types.js";
import type {TUserId} from "../../user/types/user.domain.types.js";

export type TMarkAsFavoriteUseCaseDeps = {
    markContractAsFavoriteFn: TMarkContractAsFavoriteFn;
}

export type TMarkAsFavoriteUseCase = (input: { contract_id: TContractId; user_id: TUserId }) => Promise<TContractDomainModel | null>;