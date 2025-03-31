import type {CreateUserInput, User} from "@sh3pherd/domain-user";
import type {UserId} from "@sh3pherd/domain-user/dist/types/types";

export interface IRegistrationService{
    input: {
        generateUserIdFunction: () => UserId;
        hashPasswordFunction: (input: { password: string }) => Promise<string>;
        createUserFunction: (input: CreateUserInput) => User; // ou Result<User>
        saveUserFunction: (input: User) => Promise<void>; // ou Result<User>
        findUserByEmailFunction: (input: { email: string }) => Promise<any>; // ou Result<User>

    },
    output: {
        getUserLoginByEmail: (input: { email: string }) => Promise<any>;
        registerUser: (input: { email: string; password: string }) => Promise<{ user_id: string }>;
        //manualRegistration: (input: { email: string; password: string; }) => Promise<InsertOneResult>;
    }
}

export type TRegistrationServiceOutput = IRegistrationService['output'];