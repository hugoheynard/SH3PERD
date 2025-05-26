import type {NextFunction, Request, Response} from "express";

/**
 * Method decorator to wrap an async route handler with try/catch.
 */
export function withErrorHandler<
    T extends (req: Request, res: Response, next: NextFunction) => Promise<void>
>(
    target: Object,
    propertyKey: string | symbol,
    descriptor: TypedPropertyDescriptor<T>
): TypedPropertyDescriptor<T> | void {
    const originalMethod = descriptor.value;

    if (!originalMethod) return;

    const wrapped: T = (async function (this: any, req: Request, res: Response, next: NextFunction) {
        try {
            await originalMethod.call(this, req, res, next);
        } catch (err) {
            next(err);
        }
    }) as T;

    descriptor.value = wrapped;
    return descriptor;
}
