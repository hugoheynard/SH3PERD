import type { Request, Response, NextFunction } from 'express';

export const userAlreadyExistsManual = (input: { checkUserExistByMailFunction: any }) =>
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        const { checkUserExistByMailFunction } = input;
        const { email } = req.body;

        if (!email) {
            res.status(400).json({ message: 'Email is missing from request body.' });
            return;
        }

        const user = await checkUserExistByMailFunction({ email });

        if (user) {
            res.status(409).json({ message: 'User already exists' });
            return;
        }

        next();
    };
