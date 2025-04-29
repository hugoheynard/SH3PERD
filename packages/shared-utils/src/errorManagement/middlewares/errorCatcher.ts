import type { Request, Response, NextFunction } from 'express';
import {BusinessError, TechnicalError} from "../errorClasses/index.js";

export const errorCatcher = (err: unknown, req: Request, res: Response, _next: NextFunction): void => {
    //business error
    if (err instanceof Error && err.name === 'BusinessError') {

        res.status(err.statusCode).json({
            type: 'business_error',
            code: err.errorCode,
            message: err.message
        });
        return;
    }

    //technical error
    if (err instanceof Error && err.name === 'TechnicalError') {

        console.error('[TechnicalError]', {
            path: req.path,
            method: req.method,
            error: err
        });

        res.status(err.statusCode).json({
            type: 'technical_error',
            code: err.errorCode,
            message: 'An internal error occurred'
        });
        return;
    }

    //fallback for any other error
    console.error('[UnknownError]', {
        path: req.path,
        method: req.method,
        error: err
    });

    res.status(500).json({
        type: 'unknown_error',
        message: 'Unexpected server error'
    });
}
