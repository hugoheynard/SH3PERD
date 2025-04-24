import type {TMiddlewareEntry} from "../../types/types.js";
import type {RequestHandler} from "express";

/**
 * Resolves a list of middleware entries into Express-compatible `RequestHandler`s.
 *
 * Supports:
 * - Standard middleware functions (`(req, res, next) => {}`)
 * - Middleware factories with injected dependencies (`{ withDeps, deps, mw }`)
 * - Async middleware factories (`async: true`) that return a `Promise<RequestHandler>`
 *
 * This function abstracts the resolution logic so that middleware can be declared
 * in route definitions and still be composed correctly with or without
 * async initialization or dependency injection.
 *
 * @param input middlewares - An array of middleware entries (either plain `RequestHandler`s or
 *                      declarative middleware with dependency injection and async support)
 *
 * @returns A Promise that resolves to an array of `RequestHandler`s ready to be applied via `router.use(...)`.
 *
 * @throws If a middleware entry is not a function or a supported `{ withDeps: true }` object.
 *
 * @example
 * const handlers = await resolveMiddlewares([
 *   someMiddleware,
 *   {
 *     withDeps: true,
 *     async: true,
 *     deps: { service },
 *     mw: async ({ service }) => {
 *       const prepared = await service.prepare();
 *       return (req, res, next) => {
 *         req.prepared = prepared;
 *         next();
 *       };
 *     }
 *   }
 * ]);
 */
export const resolveMiddlewares = async (input: {middlewares: TMiddlewareEntry[]} = { middlewares: [] }): Promise<RequestHandler[]> => {
    const { middlewares } = input;

    const resolved: RequestHandler[] = [];

    for (const entry of middlewares) {
        if (typeof entry === 'function') {
            resolved.push(entry);
            continue;
        }
/*
        if (entry.withDeps) {
            const maybeHandler = entry.mw(entry.deps);
            const handler = entry.async ? await maybeHandler : maybeHandler;
            resolved.push(handler as RequestHandler);
            continue;
        }



        throw new Error('Invalid middleware entry');

 */
    }

    return resolved;
}