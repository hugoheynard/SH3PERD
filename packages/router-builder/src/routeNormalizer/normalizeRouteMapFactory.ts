import type { RequestHandler } from "express";
import type {
    THttpMethod,
    TObjectRoute,
    TDeclarativeRoute,
    RouteMap
} from "../types/types.js";


export type TNormalizeRouteMapDeps = {
    splitMethodPathFn: (key: string) => [THttpMethod, string];
    defaultHandlerFn: (method: THttpMethod, path: string) => RequestHandler;
    isHandlerFn: (val: TDeclarativeRoute) => val is RequestHandler;
    isHandlerArrayFn: (val: TDeclarativeRoute) => val is RequestHandler[];
    isObjectRouteFn: (val: TDeclarativeRoute) => val is TObjectRoute;
    buildFromObjectRouteFn: (input: {
        key: string;
        routeObject: TObjectRoute;
        context: Record<string, unknown>;
    }) => Promise<RequestHandler[]>;
}

/**
 * Factory that creates a route normalizer for declarative routing systems.
 *
 * This function returns a `normalizeRouteMap` function, which transforms a `Record<MethodAndPath, TDeclarativeRoute>`
 * into a normalized `RouteMap` that is directly usable in an Express application.
 *
 * The normalization process supports three types of route declarations:
 * - A single Express handler (function)
 * - An array of handlers
 * - A declarative object route (`TObjectRoute`) containing middleware and/or a handler
 *
 * If the route declaration does not match any of the supported formats, a fallback `defaultHandlerFn` is applied.
 *
 * All utilities for distinguishing between route types (`isHandler`, `isObjectRoute`, etc.) and for building
 * middleware pipelines are injected via the `deps` parameter for better modularity and testability.
 *
 * @param deps - A collection of utility functions and pre-injected builders to support route normalization:
 * - `splitMethodPathFn`: Splits a `MethodAndPath` string into `[method, path]`.
 * - `defaultHandlerFn`: Fallback handler generator for unknown or invalid route types.
 * - `isHandlerFn`, `isHandlerArrayFn`, `isObjectRouteFn`: Type guards to classify route declarations.
 * - `buildFromObjectRouteFn`: Builder for resolving `TObjectRoute` into full middleware+handler arrays.
 *
 * @returns A `normalizeRouteMap` function that accepts raw declarative routes and a functional context,
 * and returns a Promise resolving to a normalized `RouteMap`.
 *
 * @example
 * ```ts
 * const normalizeRouteMap = createRouteNormalizer({ ... });
 *
 * const routes = await normalizeRouteMap({
 *   "get:/users": {
 *     mw: [authMiddleware],
 *     handler: (req, res) => res.send("User list")
 *   }
 * }, { userService });
 * ```
 */
export function normalizeRouteMapFactory(deps: TNormalizeRouteMapDeps) {
    return async function normalizeRouteMap<TDeps extends Record<string, unknown>>(
        rawRoutes: Record<string, TDeclarativeRoute>,
        context: TDeps
    ): Promise<RouteMap> {
        const final: RouteMap = {};

        for (const key in rawRoutes) {
            const route = rawRoutes[key];

            if (deps.isHandlerFn(route)) {
                final[key] = [route];
                continue;
            }

            if (deps.isHandlerArrayFn(route)) {
                final[key] = route;
                continue;
            }

            if (deps.isObjectRouteFn(route)) {
                final[key] = await deps.buildFromObjectRouteFn({
                    key: key,
                    routeObject: route,
                    context: context
                });
                continue;
            }

            // fallback
            const [method, path] = deps.splitMethodPathFn(key);
            final[key] = [deps.defaultHandlerFn(method, path)];
        }

        return final;
    };
}
