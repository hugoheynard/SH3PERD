import express, {type Router} from "express";


export const autoLogRouter = (autoLogFunction: any): Router => {
    const router: Router = express.Router();

    router.post('/', autoLogFunction);

    return router;
}