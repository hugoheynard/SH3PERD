import type { Request, Response, NextFunction } from "express";

/**
 * Infers input argument types from a function returning a Promise
 */
type ExtractArgs<Fn> = Fn extends (...args: infer A) => Promise<any> ? A : never;

/**
 * Infers resolved output type of a Promise-returning function
 */
type ExtractOutput<Fn> = Fn extends (...args: any[]) => Promise<infer O> ? O : never;

/**
 * Options accepted by createTypedHandler
 *
 * @template Fn - The use case or handler function type
 *
 * @property fn - The actual function to call (use case)
 * @property inputMapper - Maps an Express Request to the arguments expected by fn.
 *                         If fn takes a single argument, inputMapper can return that value directly.
 *                         If fn takes multiple arguments, inputMapper must return a tuple (array).
 * @property onSuccess - Optional function to customize the response output
 * @property nextOnError - Whether to call next(err) on error (default true)
 * @property nextOnSuccess - Whether to call next() after a successful response (default false)
 */
export type TCreateTypedHandlerOptions<Fn extends (...args: any[]) => Promise<any>> = {
    fn: Fn;
    inputMapper: (req: Request) => ExtractArgs<Fn> | ExtractArgs<Fn>[0];
    onSuccess?: (res: Response, result: ExtractOutput<Fn>) => void;
    nextOnError?: boolean;
    nextOnSuccess?: boolean;
};

/**
 * Creates a typed Express handler that delegates to a domain function (use case),
 * while keeping type safety between the input, output and the mapping from req.
 *
 * @example
 * type MyFn = (id: string) => Promise<boolean>;
 *
 * createTypedHandler<MyFn>(200, {
 *   fn: myUseCase,
 *   inputMapper: (req) => req.params.id
 * });
 *
 * @example
 * type MyFn = (id: string, page: number) => Promise<string[]>;
 *
 * createTypedHandler<MyFn>(200, {
 *   fn: myUseCase,
 *   inputMapper: (req) => [req.params.id, parseInt(req.query.page)]
 * });
 */
//TODO manage no input cases
function serializeForJson(result: unknown): any {
    if (result instanceof Map) {
        return Object.fromEntries(result);
    }

    if (result instanceof Set) {
        return [...result];
    }

    return result;
};

export function createTypedHandler<Fn extends (...args: any[]) => Promise<any>>(
    status: number,
    options: TCreateTypedHandlerOptions<Fn>
) {
    return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const rawInput = options.inputMapper(req);

            const args = Array.isArray(rawInput)
                ? rawInput // fn expects multiple args
                : [rawInput]; // fn expects one arg

            const result: ExtractOutput<Fn> = serializeForJson(await options.fn(...args as ExtractArgs<Fn>));

            if (!options.onSuccess) {
                res.status(status).json(result);
            } else {
                options.onSuccess(res, result);
            }

            if (options.nextOnSuccess) {
                return next();
            }

            return;

        } catch (err) {
            if (options.nextOnError ?? true) {
                next(err);
            } else {
                throw err;
            }
        }
    };
}
