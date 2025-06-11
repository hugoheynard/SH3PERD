import type {NextFunction, Request, Response} from 'express';
import type {BusinessError} from "../errorClasses/BusinessError.js";
import type {TechnicalError} from "../errorClasses/TechnicalError.js";

export const errorCatcher = (err: unknown, req: Request, res: Response, _next: NextFunction): void => {
    //business error
    if (isBusinessError(err)) {
        res.status(err.statusCode).json({
            type: 'business_error',
            code: err.errorCode,
            message: err.message
        });
        return;
    }

    //technical error
    if (isTechnicalError(err)) {
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


function isBusinessError(err: unknown): err is BusinessError {
    return (
        err instanceof Error &&
        err.name === 'BusinessError' &&
        'statusCode' in err &&
        'errorCode' in err
    );
}

function isTechnicalError(err: unknown): err is TechnicalError {
    return (
        err instanceof Error &&
        err.name === 'TechnicalError' &&
        'statusCode' in err &&
        'errorCode' in err
    );
}