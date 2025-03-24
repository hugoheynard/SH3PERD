import type {NextFunction, Request, Response} from "express";

export const errorCatcher = (err: any, req: Request, res: Response, next: NextFunction): void => {
    const message = err.message && err.message.trim() ? err.message : 'Internal Server Error';

    console.error('Error:', err.message);
    res.status(500).json({
        error: true,
        message: message || 'Internal Server Error',
    });
}