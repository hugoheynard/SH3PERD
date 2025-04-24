import {createRouterFromMap} from "./declarative/createRouterFromMap.js";
import type { Router } from "express";
import type {RouteDef, RouteMap} from "../../types/types.js";

/**
 * Builds an Express Router from a route definition,
 * supporting both classic `factory()` and declarative `{ routes }`.
 */
export const createRouterFromFactory = (input: {
    routeDef: RouteDef;
    routeContext: any;
}): Router => {
    const { routeDef, routeContext } = input;

    if (routeDef.factory) {
        const result = routeDef.factory(routeContext) as Router | { routes: RouteMap };

        if (!result) {
            throw new Error(`Factory in route "${routeDef.path}" returned nothing`);
        }

        if ('routes' in result) {
            return createRouterFromMap(result.routes);
        }

        if (typeof result.use === 'function') {
            return result;
        }

        throw new Error(`Factory in route "${routeDef.path}" did not return a valid Router or { routes }`);
    }

    // Legacy fallback if routes are defined outside the factory
    if (routeDef.routes) {
        const routeMap =
            typeof routeDef.routes === "function"
                ? routeDef.routes(routeContext)
                : routeDef.routes;

        const router = createRouterFromMap(routeMap);

        if (!router || typeof router.use !== "function") {
            throw new Error(
                `Routes declaration in "${routeDef.path}" did not return a valid Express Router`
            );
        }

        return router;
    }

    throw new Error(
        `Route "${routeDef.path}" is missing both a factory and a routes declaration`
    );
};
