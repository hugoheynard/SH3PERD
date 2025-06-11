import type {TMarkAsFavoriteUseCase, TMarkAsFavoriteUseCaseDeps} from "../types/contracts.useCases.types.js";

export const createMarkAsFavoriteUseCase = (deps: TMarkAsFavoriteUseCaseDeps):TMarkAsFavoriteUseCase=> {
    const { markContractAsFavoriteFn} = deps;

    return async (input) => {
        const { contract_id, user_id } = input;

        // Check if the contract is already marked as favorite
        return await markContractAsFavoriteFn({ contract_id, user_id });
    };
};