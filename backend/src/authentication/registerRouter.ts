import express, {type Router} from "express";
import {validManualRegisterInput} from "./middlewares/register/validManualRegisterInput";
import {addRegistrationMethod} from "./middlewares/register/addRegistrationMethod";
import {userAlreadyExistsManual} from "./middlewares/register/userAlreadyExistsManual";
import type {Collection} from "mongodb";

export const registerRouter = (authCtrl: any, userLoginCollection: Collection): Router => {
    const router: Router = express.Router();

    router.post('/',
        validManualRegisterInput,
        addRegistrationMethod({ registrationMethod: 'manualRegistration'}),
        userAlreadyExistsManual({ userLoginCollection }),
        authCtrl.register);

    //router.post('/0Auth')


    return router;
};