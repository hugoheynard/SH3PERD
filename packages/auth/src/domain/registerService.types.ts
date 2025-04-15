import type {
    CreateUserInput,
    TFindUserByEmail,
    TSaveUser,
    TSaveUserResult,
} from "@sh3pherd/user";

import type {TUserDomainModel_shared, TUserId_shared} from "@sh3pherd/shared-types";
import type {THashPassword} from "./passwordManager.types";


export interface RegisterServiceTypes {
    generateUserIdFn: () => TUserId_shared;
    hashPasswordFn: THashPassword;
    createUserFn: (input: CreateUserInput) => TUserDomainModel_shared;
    saveUserFn: TSaveUser;
    findUserByEmailFn: TFindUserByEmail; // ou Result<User>
}

export interface IRegisterService {
    getUserByEmail: (input: { email: string }) => Promise<TUserDomainModel_shared | null>;
    registerUser: (input: { email: string; password: string }) => Promise<TSaveUserResult>;
}