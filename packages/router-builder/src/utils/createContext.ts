import type {RouteDef} from "../types/types.js";

/**
 * Extracts the injection context from a RouteDef.
 *
 * This utility is used in routing systems to extract the `inject` property
 * from a `RouteDef`, which contains the functional context (services, configs, etc.)
 * that should be passed to the route factory.
 *
 * If the route does not define any `inject` object, an empty context is returned instead.
 *
 * @param input.routeDef - A `RouteDef` object, potentially containing an `inject` field.
 * @returns The contextual injection object to be used in the module, or an empty object if none is defined.
 *
 * @example
 * ```ts
 * const context = createContext({
 *   routeDef: {
 *     path: "/users",
 *     inject: { userService }
 *   }
 * });
 * // context = { userService }
 * ```
 */
export function createContext<TDeps extends Record<string, unknown>>(input: {
    routeDef: RouteDef<TDeps>;
}): TDeps {
    return input.routeDef.inject || {} as TDeps;
}
