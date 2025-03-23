import {wrapServiceWithTryCatch} from "../services/tryCatchServiceWrapper";
import {ObjectId} from "mongodb";
import type {IRegistrationService} from "./interfaces/IRegistrationService";

export const registrationService = (input: IRegistrationService['input']): IRegistrationService['output'] => {
    const { users_loginsCollection } = input;

    const service: IRegistrationService['output'] = {

        getUserLoginByEmail: async (input: { email: string }): Promise<any> => {
          return await users_loginsCollection.findOne({ email: input.email });
        },

        manualRegistration: async (input: { email: string; password: string; }): Promise<any> => {
            const user = {
                email: input.email,
                password: input.password,
                created_at: new Date(),
                userProfile_id: new ObjectId(),
            };

            return await users_loginsCollection.insertOne(user);
        }
    };

    return wrapServiceWithTryCatch({
        service: service,
        serviceName: 'Registration Service'
    });
};