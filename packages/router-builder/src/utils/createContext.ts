import type {RouteDef} from "../types/TRouteDef";
import type {RouteFactoryContext} from "../types/types";

/**
 * Returns the injection context for this route.
 */
export function createContext(input: { routeDef: RouteDef }): RouteFactoryContext {
    return input.routeDef.inject || {};
}
