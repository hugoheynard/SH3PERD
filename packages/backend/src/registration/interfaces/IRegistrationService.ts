import type {Collection, InsertOneResult} from "mongodb";

export interface IRegistrationService{
    input: {
        users_loginsCollection: Collection;
    },
    output: {
        manualRegistration: (input: { email: string; password: string; }) => Promise<InsertOneResult>;
    }
}