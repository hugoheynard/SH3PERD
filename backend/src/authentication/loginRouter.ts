import express, {type Router} from "express";
import {validateAuthInput} from "./middlewares/validateAuthInput";


export const loginRouter = (loginFunc: any): Router => {
    const router: Router = express.Router();

    router.post('/', validateAuthInput, loginFunc);

    return router;
};