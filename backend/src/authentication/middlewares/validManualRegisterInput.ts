import type { Request, Response, NextFunction } from 'express';

export const validManualRegisterInput = (req: Request, res: Response, next: NextFunction): void => {
    const { email, password } = req.body;

    if (!email || typeof email !== 'string') {
        res.status(400).json({ message: 'Email is required and must be a string.' });
        return;
    }

    if (!password || typeof password !== 'string') {
        res.status(400).json({ message: 'Password is required and must be a string.' });
        return;
    }

    // Vérifie le format de l'email
    const emailRegex:RegExp = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        res.status(400).json({ message: 'Invalid email format.' });
        return;
    }

    // Vérifie le password : pas d'espaces + longueur minimale
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
