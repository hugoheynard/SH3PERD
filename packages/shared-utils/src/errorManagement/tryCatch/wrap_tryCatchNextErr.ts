import type { Request, Response, NextFunction } from 'express';

type AsyncHandler = (req: Request, res: Response, next: NextFunction) => Promise<any>;

type WrapHandlers<T extends Record<string, AsyncHandler>> = {
    [K in keyof T]: AsyncHandler;
};

export const wrap_tryCatchNextErr = <T extends Record<string, AsyncHandler>>(controller: T): WrapHandlers<T> => {
    const wrapped = {} as WrapHandlers<T>;

    for (const key in controller) {
        const handler = controller[key];
        wrapped[key] = async (req, res, next) => {
            try {
                await handler(req, res, next);
            } catch (err) {
                next(err);
            }
        };
    }

    return wrapped;
};
