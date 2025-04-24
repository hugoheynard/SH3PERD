import type {RequestHandler} from "express";
import type {IAbstractMiddlewareResolver, MethodAndPath, TObjectRoute} from "../../types/types.js";


/**
 * Creates a route builder utility configured with system-level dependencies.
 *
 * This factory isolates technical dependencies like middleware resolution and fallback handler logic,
 * returning a route builder ready to be used in declarative normalization pipelines.
 *
 * @param deps.mwResolver - Resolves middleware arrays (`TMiddlewareEntry[]`) to Express-compatible handlers.
 * @param deps.defaultHandlerFn - Generates fallback request handlers when none are defined in the route.
 * @param deps.splitMethodPathFn - Utility function that splits a `MethodAndPath` into `[method, path]`.
 *
 * @returns A function that resolves a `TObjectRoute` into a full Express middleware + handler array.
 */
export function buildFromObjectRouteFactory(deps: {
    splitMethodPathFn: (key: string) => [string, string],
    mwResolver: IAbstractMiddlewareResolver;
    defaultHandlerFn: (method: string, path: string) => RequestHandler;
}) {
    /**
     * Transforms a declarative route object into an executable Express pipeline of middlewares and handlers.
     *
     * @param input.key - A `method:path` identifier (e.g., `"get:/users"`).
     * @param input.routeObject - Declarative route object containing handler and middleware declarations.
     * @param input.context - Runtime context used for resolving middlewares (e.g., services, configurations).
     *
     * @returns A Promise resolving to an ordered array of middleware + handler functions.
     */
    return async function buildFromObjectRoute(input: {
        key: string,
        routeObject: TObjectRoute,
        context: Record<string, unknown>
    }): Promise<RequestHandler[]> {
        const {key, routeObject, context} = input;

        const [method, subPath] = deps.splitMethodPathFn(key);

        // Set up context for middleware resolution
        deps.mwResolver.setContext(context);

        // Resolve all declared middlewares (if any)
        const middlewares = routeObject.mw ? await deps.mwResolver.resolveAll(routeObject.mw) : [];

        // Determine the route handler, falling back to a default if not provided
        const handler = routeObject.handler ?? deps.defaultHandlerFn(method, subPath);
        const handlerArray = Array.isArray(handler) ? handler : [handler];

        // Return the composed middleware + handler array

        return [...middlewares, ...handlerArray];
    }
}