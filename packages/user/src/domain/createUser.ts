import type {CreateUserFunction} from "./types";


export const createUser: CreateUserFunction = (input) => {
    const { email, password, user_id } = input;
    return {
        user_id,
        email,
        password,
        created_at: new Date(),
        updated_at: new Date(),
    };
};