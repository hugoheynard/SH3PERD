import type {NextFunction, Request, Response} from "express";
import {wrap_TryCatchNextErr} from "../controllers/utilities/wrap_tryCatchNextErr";
import {ObjectId} from "mongodb";

export const authenticationController = (input: any): any => {
    const { authenticationService } = input;

    const controller = {
        async register(req: Request, res: Response, next: NextFunction): Promise<void> {
            if (req.body.registrationMethod === 'manual') {
                const result = await authenticationService.manualRegistration({
                    email: req.body.email,
                    password: req.body.password,
                });
            }
        },

        async login(req: Request, res: Response, next: NextFunction): Promise<void> {
            try {
                const token = await authenticationService.login({ email: req.body.email, password: req.body.password });
                res.status(200).json({
                    message: 'Login successful',
                    body: {
                        authToken: token
                    }
                });
                return;

            } catch (err: any){
                next(err);
            }
        },

        async autoLog(req: Request, res: Response, next: NextFunction): Promise<void> {
            try {
                const { authToken } = req.body;
                if (!authToken) {
                    return res.status(400).json({ message: 'auth_token is required' });
                }

                const authTokenValid = await authenticationService.autoLog({ jwt: authToken });

                if (!authTokenValid) {
                    res.status(401).json({
                        message: 'invalid auth_token'
                    })
                    return;
                }

                res.status(200).json({
                    message: 'valid auth_token'
                })
            } catch(err: any) {
                next(err);
            }
        },


    }

    return wrap_TryCatchNextErr(controller);
}