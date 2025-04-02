import type {UserId} from "@sh3pherd/domain-user/dist/types/types";
import type {THashPasswordFunction} from "../../types";
import type {CreateUserInput, UserDomainModel} from "@sh3pherd/domain-user";


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