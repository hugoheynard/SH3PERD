import type {Router} from "express";
import express from "express";
import type {IRegisterRouterInput} from "../types/types";



export const createRegisterRouter = (input: IRegisterRouterInput): Router => {
    const { registerController, registerMiddlewares } = input;

    const registerRouter: Router = express.Router();

    registerRouter.post('/',
        registerMiddlewares.validateRegistrationInput,
        registerController.registerUser
    );


    //router.post('/0Auth')
    return registerRouter;
};