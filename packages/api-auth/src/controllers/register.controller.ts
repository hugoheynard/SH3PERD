import type {NextFunction, Request, Response} from "express";
import {wrap_TryCatchNextErr} from "../../../backend/src/controllers/utilities/wrap_tryCatchNextErr";
import type {IRegistrationController} from "../types/IRegistrationController";


export const registerController = (input: IRegistrationController['input']): IRegistrationController['output'] => {
    const { registrationService } = input;

    const controller: IRegistrationController['output'] = {

        registerUser: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
            if (req.body.registrationMethod === 'manual') {
                const manualRegistrationResult = await registrationService.manualRegistration({
                    email: req.body.email,
                    password: req.body.password,
                });

                if (manualRegistrationResult.acknowledged) {
                    const user_id = manualRegistrationResult.insertedId;

                    // Create user profile with inserted Id en foreign key
                }

                res.status(201).json(manualRegistrationResult);
            }

        },
    };

    return wrap_TryCatchNextErr(controller);
}

