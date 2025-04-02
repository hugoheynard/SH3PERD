import type {THashPasswordFunction} from "../../domain/types";
import type {CreateUserInput, UserDomainModel, UserId} from "@sh3pherd/user";


export interface IRegisterServiceInput {
    generateUserIdFunction: () => UserId;
    hashPasswordFunction: THashPasswordFunction;
    createUserFunction: (input: CreateUserInput) => UserDomainModel; // ou Result<User>
    saveUserFunction: (input: UserDomainModel) => Promise<void>; // ou Result<User>
    findUserByEmailFunction: (input: { email: string }) => Promise<UserDomainModel>; // ou Result<User>
}

export interface IRegisterService {
    getUserByEmail: (input: { email: string }) => Promise<UserDomainModel>;
    registerUser: (input: { email: string; password: string }) => Promise<{ user_id: string }>;
}