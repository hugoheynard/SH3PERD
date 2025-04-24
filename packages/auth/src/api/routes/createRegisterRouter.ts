import type {Router} from "express";
import express from "express";


export type IRegisterRouterDeps = {
    registerUser: (req, res, next) => Promise<void>;
    validateRegisterInput: (req, res, next) => Promise<void>;
}

export const createRegisterRouter = (input: IRegisterRouterDeps): Router => {
    const { registerUser, validateRegisterInput } = input;

    const registerRouter: Router = express.Router();

    registerRouter.post('/', validateRegisterInput, registerUser);

    //router.post('/0Auth')
    return registerRouter;
};