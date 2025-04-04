import type {THashPasswordFunction} from "./function.types";
import type {
    CreateUserInput,
    TFindUserByEmailFunction,
    TSaveUserFunction, TSaveUserResult,
    UserDomainModel,
    UserId
} from "@sh3pherd/user";


export interface IRegisterServiceInput {
    generateUserIdFunction: () => UserId;
    hashPasswordFunction: THashPasswordFunction;
    createUserFunction: (input: CreateUserInput) => UserDomainModel;
    saveUserFunction: TSaveUserFunction;
    findUserByEmailFunction: TFindUserByEmailFunction; // ou Result<User>
}

export interface IRegisterService {
    getUserByEmail: (input: { email: string }) => Promise<UserDomainModel | null>;
    registerUser: (input: { email: string; password: string }) => Promise<TSaveUserResult>;
}