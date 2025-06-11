import type {NextFunction, Request, Response} from 'express';


export const errorCatcherMw_simple = (err: any, req: Request, res: Response, _next: NextFunction): void => {
    const message = typeof err?.message === 'string' && err.message.trim().length > 0
        ? err.message.trim()
        : 'Internal Server Error';

    console.error('[ERROR]', {
        message: err?.message,
        stack: err?.stack,
        path: req.originalUrl,
        method: req.method,
    });

    res.status(500).json({
        error: true,
        message,
    });
};