import type {CreateUserInput, UserDomainModel} from "./types/types";


export const createUser = (input: CreateUserInput): UserDomainModel => {
    const { email, password, user_id } = input;
    return {
        user_id,
        email,
        password,
        created_at: new Date(),
        updated_at: new Date(),
    };
};