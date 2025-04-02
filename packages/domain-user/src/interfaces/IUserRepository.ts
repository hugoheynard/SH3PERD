import type {UserDomainModel} from "../types/types";

export interface IUserRepository {
    saveUser: (input: { user: UserDomainModel }) => Promise<void>;
    findUserByEmail: (input: { email: string }) => Promise<UserDomainModel | null>;
}