import type {NextFunction, Request, Response} from "express";
import type {IRegistrationService} from "@sh3pherd/auth-core/dist/types/IRegistrationService";

export interface IRegistrationController{
    input: {
        registrationService: IRegistrationService['output'];
    },
    output: {
        getUserLoginByEmail: (req: Request, res: Response, next: NextFunction) => Promise<void>;
        registerUser: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    }
}