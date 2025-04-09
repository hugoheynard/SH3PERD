import {type NextFunction, type Request, type Response} from 'express';

interface AuthBody {
    email?: string;
    password?: string;
}

export const validateAuthInput = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const {email, password} = req.body;

    try {

        if (!email) {
            res.status(401).json({message: 'Missing email'});
            return;
        }

        if (!password) {
            res.status(401).json({message: 'Missing password'});
            return;
        }

        req.body.email = email.trim().toLowerCase();
        req.body.password = password.trim();
        next();

    } catch (err) {
        next(err);
    }
};