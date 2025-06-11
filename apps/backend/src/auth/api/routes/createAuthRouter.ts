import {Rider} from "@sh3pherd/router-builder";
import type {NextFunction, Request, Response, Router} from "express";
import {validateCredentialsInput} from "../middlewares/validateCredentialsInput.js";


export type TRegisterRouterDeps = {
    registerUserCtrl: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    validateCredentialsInputMw: (req: Request, res: Response, next: NextFunction) => void;
}

export type TLoginRouterDeps = {
    validateCredentialsInputMw: (req: Request, res: Response, next: NextFunction) => void;
    loginUserCtrl: (req: Request, res: Response, next: NextFunction) => Promise<void>;
}

export type TRefreshRouterDeps = {
    refreshAuthSessionCtrl: (req: Request, res: Response, next: NextFunction) => Promise<void>;
}




export const createAuthRouter = async (deps: {
    registerUserCtrl: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    loginUserCtrl: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    refreshAuthSessionCtrl: (req: Request, res: Response, next: NextFunction) => Promise<void>;
}): Promise<Router> => {

    const registerModule = Rider.def<TRegisterRouterDeps>({
        path: "/register",
        inject: {
            registerUserCtrl: deps.registerUserCtrl,
            validateCredentialsInputMw: validateCredentialsInput
        },
        routes: ({ registerUserCtrl, validateCredentialsInputMw }) => ({
            "post:/": [validateCredentialsInputMw, registerUserCtrl],
        })
    });

    const loginModule = Rider.def<TLoginRouterDeps>({
        path: "/login",
        inject: {
            loginUserCtrl: deps.loginUserCtrl,
            validateCredentialsInputMw: validateCredentialsInput
        },
        routes: ({ loginUserCtrl, validateCredentialsInputMw }) => ({
            "post:/": [validateCredentialsInputMw, loginUserCtrl]
        }),
    });

    const refreshModule = Rider.def<TRefreshRouterDeps>({
        path: "/refresh",
        inject: { refreshAuthSessionCtrl: deps.refreshAuthSessionCtrl},
        routes: ({ refreshAuthSessionCtrl }) => ({
            "post:/": [refreshAuthSessionCtrl]
        })
    });


    return await new Rider()
        .build({ routeDefs: [
                Rider.def({
                    path: "/auth",
                    inject: {},
                    children: [registerModule, loginModule, refreshModule]
                })]
        });
}