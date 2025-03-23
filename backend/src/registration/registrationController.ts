import type {NextFunction, Request, Response} from "express";
import {wrap_TryCatchNextErr} from "../controllers/utilities/wrap_tryCatchNextErr";
import type {IRegistrationController} from "./interfaces/IRegistrationController";


export const registrationController = (input: IRegistrationController['input']): IRegistrationController['output'] => {
    const { registrationService } = input;

    const controller: IRegistrationController['output'] = {

        registerUser: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
            console.log('ive been hit');
            if (req.body.registrationMethod === 'manual') {
                const result = await registrationService.manualRegistration({
                    email: req.body.email,
                    password: req.body.password,
                });
                res.status(201).json(result);
            }
        },
    };

    return wrap_TryCatchNextErr(controller);
}

