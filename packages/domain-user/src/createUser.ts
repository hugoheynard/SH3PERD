import type {CreateUserInput, User} from "./types/types";


export const createUser = ({ email, password }: CreateUserInput): User => {
    return {
        user_id: generateUserId(),
        email,
        password,
        created_at: new Date(),
        updated_at: new Date(),
    };
};