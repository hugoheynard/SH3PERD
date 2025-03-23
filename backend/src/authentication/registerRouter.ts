import express, {type Router} from "express";
import {validManualRegisterInput} from "./middlewares/validManualRegisterInput";
import {addRegisterMethodManual, addRegistrationMethod} from "./middlewares/addRegistrationMethod";

export const registerRouter = (authCtrl: any): Router => {
    const router: Router = express.Router();

    router.post('/',
        validManualRegisterInput(),
        addRegistrationMethod({ registrationMethod: 'manualRegistration'}),
        authCtrl.register);


    return router;
}

