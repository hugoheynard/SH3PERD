import type {User} from "../types/types";

export interface IUserRepository {
    saveUser: (input: { user: User }) => Promise<void>;
    findUserByEmail: (input: { email: string }) => Promise<User | null>;
}