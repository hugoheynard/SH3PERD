import express, {type Router} from "express";
import {loginRouter} from "./loginRouter";
import {autoLogRouter} from "./autoLogRouter";
import {registerRouter} from "./registerRouter";


export const authenticationRouter = (loginController: any): Router => {
    const { login, autoLog } = loginController;
    const router: Router = express.Router();

    router.use('/login', loginRouter(login));
    router.use('/autoLog', autoLogRouter(autoLog));
    router.use('/register', registerRouter())

    return router;
};