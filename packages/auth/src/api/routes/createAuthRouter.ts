import {Rider} from "@sh3pherd/router-builder";
import type {NextFunction, Request, Response, Router} from "express";
import {validateCredentialsInput} from "../middlewares/validateCredentialsInput.js";


export type TRegisterRouterDeps = {
    registerUserCtrl: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    validateCredentialsInputMw: (req: Request, res: Response, next: NextFunction) => void;
}


export const createAuthRouter = async (deps: {
    registerUserCtrl: (req: Request, res: Response, next: NextFunction) => Promise<void>;
}): Promise<Router> => {

    return await new Rider()
        .build({ routeDefs: [
                Rider.def({
                    path: "/auth",
                    inject: {},
                    children: [
                        Rider.def<TRegisterRouterDeps>({
                            path: "/register",
                            inject: {
                                registerUserCtrl: deps.registerUserCtrl,
                                validateCredentialsInputMw: validateCredentialsInput
                            },
                            routes: ({ registerUserCtrl, validateCredentialsInputMw }) => ({
                                "post:/": {
                                    handler: registerUserCtrl,
                                    mw: [validateCredentialsInputMw]
                                }
                            })


                        }),
                        /*
                        Rider.def({
                            path: "/login",
                            routes: () => ({
                                "post:/": (req, res) => res.send("Login")
                            }),
                        }),
                         */
                    ]
                })]
        });
}