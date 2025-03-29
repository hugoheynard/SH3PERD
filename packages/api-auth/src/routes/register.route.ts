import type {IRegistrationController} from "../types/IRegistrationController";
import type {IRegistrationMiddlewares} from "../types/IRegistrationMiddlewares";
import type {Router} from "express";
import express from "express";

export interface IRegistrationRouter {
    registrationController: IRegistrationController['output'];
    registrationMiddlewares: IRegistrationMiddlewares['output'];
}

export const registerRouter = (input: IRegistrationRouter): Router => {
    const { registrationController, registrationMiddlewares } = input;

    const registrationRouter: Router = express.Router();

    registrationRouter.post('/',
        registrationMiddlewares.validManualRegisterInput,
        //registrationMiddlewares.addRegistrationMethod({ registrationMethod: 'manual'}),
        //registrationMiddlewares.userAlreadyExistsManual,
        registrationController.registerUser);


    //router.post('/0Auth')
    return registrationRouter;
};