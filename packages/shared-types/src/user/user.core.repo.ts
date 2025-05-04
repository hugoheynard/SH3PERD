import type {TUserDomainModel} from "./user.domain.types.js";
import type {Collection} from "mongodb";

export type TSaveUserFn = (input: { user: TUserDomainModel }) => Promise<boolean>;
export type TFindUserByEmailFn = (filter: { email: string }) => Promise<TUserDomainModel | null>;


export type TUserMongoRepositoryDeps = { userCollection: Collection<TUserDomainModel> };

export interface IUserRepository {
    saveUser: TSaveUserFn;
    findUserByEmail: TFindUserByEmailFn;
}