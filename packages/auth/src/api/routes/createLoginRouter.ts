import express, {type Router} from "express";


export const createLoginRouter = (input: { loginFn: any }): Router => {
    const router: Router = express.Router();

    router.post('/', input.loginFn);

    return router;
};