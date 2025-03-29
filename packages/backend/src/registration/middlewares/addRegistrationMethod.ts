import type { NextFunction, Request, Response } from "express";
import type { IRegistrationMethods } from "../../../../api-auth/src/types/IRegistrationMethod";

/**
 * Middleware factory that injects a specific registration method into the request body.
 * @param input - Object containing the registration method to inject
 */
export const addRegistrationMethod = (input: { registrationMethod: IRegistrationMethods }) => {
    if (!input?.registrationMethod) {
        throw new Error('addRegistrationMethod: input.registrationMethod is required');
    }

    return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        void res;
        req.body.registrationMethod = input.registrationMethod;
        next();
    };
};
