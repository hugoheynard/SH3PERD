import type {IRegistrationController} from "./interfaces/IRegistrationController";
import type {IRegistrationMiddlewares} from "./interfaces/IRegistrationMiddlewares";
import type {Router} from "express";
import express from "express";

export interface IRegistrationRouter {
    registrationController: IRegistrationController['output'];
    registrationMiddlewares: IRegistrationMiddlewares['output'];
}

export const registrationRouter = (input: IRegistrationRouter): Router => {
    const { registrationController, registrationMiddlewares } = input;

    const registrationRouter: Router = express.Router();

    registrationRouter.post('/',
        registrationMiddlewares.validManualRegisterInput,
        registrationMiddlewares.addRegistrationMethod({ registrationMethod: 'manual'}),
        registrationMiddlewares.userAlreadyExistsManual,
        registrationController.registerUser);


    //router.post('/0Auth')
    return registrationRouter;
};