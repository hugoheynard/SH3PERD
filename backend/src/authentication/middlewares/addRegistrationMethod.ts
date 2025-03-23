import type { NextFunction, Request, Response } from "express";
import type { IRegistrationMethods } from "../interfaces/IRegistrationMethod";

/**
 * Middleware factory that injects a specific registration method into the request body.
 * @param input - Object containing the registration method to inject
 * @returns Middleware function for Express
 */
export const addRegistrationMethod = (input: { registrationMethod: IRegistrationMethods }) => {
    if (!input?.registrationMethod) {
        throw new Error('addRegistrationMethod: input.registrationMethod is required');
    }

    return (req: Request, res: Response, next: NextFunction): void => {
        req.body.registrationMethod = input.registrationMethod;
        next();
    };
};
