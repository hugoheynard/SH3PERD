import type {TCreateUserInput} from "../types/user.core.contracts.js";
import type {TUserDomainModel} from "../types/user.domain.types.js";


export const createUser = (input: TCreateUserInput): TUserDomainModel => {
    const { email, password, user_id } = input;
    return {
        user_id,
        email,
        password,
        created_at: new Date(),
        updated_at: new Date(),
    };
};