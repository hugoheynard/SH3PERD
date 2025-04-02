import type { Request, Response, NextFunction } from 'express';

export const validateRegistrationInput = (req: Request, res: Response, next: NextFunction): void | Promise<void> => {
    const { email, password } = req.body;

    if (email === undefined || password=== undefined) {
        res.status(400).json({ message: 'Missing email or password' });
        return;
    }

    if (typeof email !== 'string' || email.trim() === '') {
        res.status(400).json({ message: 'Email is required and must be a string.' });
        return;
    }

    if (typeof password !== 'string' || password.trim() === '') {
        res.status(400).json({ message: 'Password is required and must be a string.' });
        return;
    }

    const emailRegex: RegExp = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        res.status(400).json({ message: 'Invalid email format.' });
        return;
    }

    if (password.includes(' ')) {
        res.status(400).json({ message: 'Password should not contain spaces.' });
        return;
    }

    if (password.length < 8) {
        res.status(400).json({ message: 'Password should be at least 8 characters long.' });
        return;
    }

    next();
};
