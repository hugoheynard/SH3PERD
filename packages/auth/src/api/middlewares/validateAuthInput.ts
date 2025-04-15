import type {NextFunction, Request, Response} from 'express';

interface AuthBody {
    email?: string;
    password?: string;
}

export const validateAuthInput = (req: Request<{}, {}, AuthBody>, res: Response, next: NextFunction): void => {
    const {email, password} = req.body;

    try {
        if (!email) {
            res.status(400).json({message: 'Missing email'});
            return;
        }

        if (!password) {
            res.status(400).json({message: 'Missing password'});
            return;
        }

        if (typeof email !== 'string' || typeof password !== 'string') {
            res.status(400).json({message: 'Email and password must be a string'});
            return;
        }

        req.body.email = email.trim().toLowerCase();
        req.body.password = password.trim();
        next();

    } catch (err) {
        next(err);
    }
};