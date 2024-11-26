import express, {type NextFunction, type Request, type Response, type Router} from "express";


export const userRouter = (staffController: any): Router => {
    const router: Router = express.Router();

    router.post('/id',
        async (req: Request, res: Response, next: NextFunction): Promise<void> => {
            const {id} = req.body;

            //const response = await staffController.getSingleStaff_byId(id);
        });

    return router;
};