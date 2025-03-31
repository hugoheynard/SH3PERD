import type {CreateUserInput, User} from "./types/types";


export const createUser = ({ email, password, user_id }: CreateUserInput): User => {
    return {
        user_id,
        email,
        password,
        created_at: new Date(),
        updated_at: new Date(),
    };
};