import {type NextFunction, type Request, type Response} from "express";
import {type Collection} from "mongodb";

export const userExistsCheck = (collection: Collection<any>) => async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const user: any = await collection.findOne({'login.inApp.email': req.body.email});

        if (!user) {
            res.status(401).json({message: 'Invalid credentials / email'});
            return;
        }

        req.body.user = user;
        next();
    } catch (err) {
        next(err);
    }
};