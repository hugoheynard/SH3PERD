import type {NextFunction, Request, Response} from "express";
import type {IRegistrationController} from "../types/IRegistrationController";
import {wrap_tryCatchNextErr} from "@sh3pherd/shared-utils";


export const registrationController = (input: IRegistrationController['input']): IRegistrationController['output'] => {
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

    return wrap_tryCatchNextErr(controller);
}

