import type {RequestHandler} from "express";
import type {IRegistrationMethods} from "./IRegistrationMethod";

export interface IRegistrationMiddlewares{
    input: {
        checkUserExistByMailFunction: (input: { email : string }) => Promise<any>;
    },
    output: {
        validManualRegisterInput: RequestHandler;
        addRegistrationMethod: (input: { registrationMethod: IRegistrationMethods }) => RequestHandler;
        userAlreadyExistsManual: RequestHandler;
    }
}