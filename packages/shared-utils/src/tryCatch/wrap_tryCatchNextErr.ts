import type { Request, Response, NextFunction} from 'express';

type AnyHandler = (...args: any[]) => any;
type HandlerObject = Record<string, AnyHandler>;

export const wrap_tryCatchNextErr = <T extends HandlerObject>(handlers: T): T => {
    const wrapped = {} as T;

    for (const key of Object.keys(handlers) as (keyof T)[]) {
        const handler = handlers[key];

        if (typeof handler === 'function') {
            wrapped[key] = (async (req: Request, res: Response, next: NextFunction) => {
                try {
                    await handler(req, res, next);
                } catch (err) {
                    next(err);
                }
            }) as T[typeof key];
        } else {
            wrapped[key] = handler;
        }
    }

    return wrapped;
};
