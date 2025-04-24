import type {TUserDomainModel} from "./user.domain.types.js";

export type TSaveUserResult = { success: boolean; reason?: string; }
export type TSaveUser = (input: { user: TUserDomainModel }) => Promise<TSaveUserResult>;
export type TFindUserByEmail = (input: { email: string }) => Promise<TUserDomainModel | null>;

export interface IUserRepository {
    saveUser: TSaveUser;
    findUserByEmail: TFindUserByEmail;
}