import type {NextFunction, Request, Response} from "express";
import type {ICreateRegisterControllerInput, IRegisterController} from "./IRegisterController";
import {wrap_tryCatchNextErr} from "@sh3pherd/shared-utils";


export const createRegisterController = (input: ICreateRegisterControllerInput): IRegisterController=> {
    const { registerService } = input;

    const controller: IRegisterController = {
        registerUser: async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
            const { email, password } = req.body;
            const result = await registerService.registerUser({ email, password });
            res.status(201).json(result);
            return;
        },
        getUserByEmail: async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
            const { email } = req.body;
            const result = await registerService.getUserByEmail({ email });
            res.status(200).json(result);
            return;
        }
    };

    return wrap_tryCatchNextErr(controller);
}

