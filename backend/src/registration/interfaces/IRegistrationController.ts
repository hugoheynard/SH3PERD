import type {NextFunction, Request, Response} from "express";
import type {IRegistrationService} from "./IRegistrationService";

export interface IRegistrationController{
    input: {
        registrationService: IRegistrationService['output'];
    },
    output: {
        getUserLoginByEmail: (req: Request, res: Response, next: NextFunction) => Promise<void>;
        registerUser: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    }
}