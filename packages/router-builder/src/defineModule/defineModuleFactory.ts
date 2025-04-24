import type {MethodAndPath, RouteDef, RouteFactoryContext, RouteMap, TDeclarativeRoute} from "../types/types.js";

/**
* Creates a module definition factory for declarative routing systems.
*
* This factory function allows you to define self-contained route modules
* with context-aware dependencies (`inject`), declarative route definitions,
* and optional children modules. It returns a `RouteDef` that integrates into a
* composable routing engine (e.g., with `RouterBuilder`).
*
* The `normalizeRouteMap` function is injected as a dependency, enabling full
* customization of the route resolution logic (middleware resolution, handler fallback, etc.).
*
* @template TDeps - The shape of the injected dependencies/context used within the module.
*
* @param deps.normalizeRouteMap - A normalization function that converts declarative route objects
* into executable Express-compatible handler arrays. It handles typing, middlewares, and defaults.
*
* @returns A strongly-typed `defineModule` function, allowing to construct `RouteDef<TDeps>` objects
* with safe injection and route resolution logic.
*
* @example
* ```ts
 * const defineModule = defineModuleFactory({ normalizeRouteMap });
 *
 * const usersModule = defineModule({
 *   path: "/users",
 *   inject: { userService },
 *   routes: ({ userService }) => ({
 *     "get:/": {
 *       handler: userService.list
 *     }
 *   })
 * });
 * ```
*/
type TModuleInput<TDeps extends RouteFactoryContext> = {
    path: `/${string}`;
    inject?: TDeps;
    routes: (context: TDeps) => Record<MethodAndPath, TDeclarativeRoute>;
    children?: RouteDef[];
};

export function defineModuleFactory(deps: {
    normalizeRouteMap: <TDeps extends Record<string, unknown>>(
        rawRoutes: Record<string, TDeclarativeRoute>,
        context: TDeps
    ) => Promise<RouteMap>;
}) {
    return function defineModule<TDeps extends RouteFactoryContext>(
        input: TModuleInput<TDeps>
    ): RouteDef<TDeps>{
        return {
            path: input.path,
            inject: input.inject,
            children: input.children,
            factory: async (context: RouteFactoryContext) => {
                const typedContext = context as TDeps;
                const rawRoutes = input.routes(typedContext);

                return {
                    routes: await deps.normalizeRouteMap(rawRoutes, typedContext)
                };
            }
        };
    };
}

