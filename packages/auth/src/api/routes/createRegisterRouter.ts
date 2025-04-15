import type {Router} from "express";
import express from "express";
import type {IRegisterRouterInput} from "../../types/types";



export const createRegisterRouter = (input: IRegisterRouterInput): Router => {
    const { registerController} = input;

    const registerRouter: Router = express.Router();

    registerRouter.post('/',
        registerController.registerUser
    );

    //router.post('/0Auth')
    return registerRouter;
};