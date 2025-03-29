import type {RequestHandler} from "express";
import type {IRegistrationMethods} from "./IRegistrationMethod";

export interface IRegistrationMiddlewares{
    validManualRegisterInput: RequestHandler;
    //addRegistrationMethod: (input: { registrationMethod: IRegistrationMethods }) => RequestHandler;
    //userAlreadyExistsManual: RequestHandler;
}