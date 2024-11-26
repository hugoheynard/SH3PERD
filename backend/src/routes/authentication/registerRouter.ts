import express, {type Router} from "express";

export const registerRouter = (): Router => {
    const router: Router = express.Router();
    /*
        router.post('/', async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
            //const { email, password } = req.body;

        });
    */
    return router;
}

