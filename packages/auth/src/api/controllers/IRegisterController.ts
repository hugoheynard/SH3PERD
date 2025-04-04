import type {NextFunction, Request, Response} from "express";
import type {IRegisterService} from "../../domain/models/IRegisterServiceInput";



export interface ICreateRegisterControllerInput {
    registerService: IRegisterService;
}

export interface IRegisterController {
    getUserByEmail: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    registerUser: (req: Request, res: Response, next: NextFunction) => Promise<void>;
}