import type { RouteDef } from "../types/types.js";

/**
 * Validates a `RouteDef` structure to ensure it complies with expected routing contract.
 *
 * This utility performs structural checks on a given route definition to ensure:
 * - the `path` is a valid string starting with `/`
 * - the `factory` function is defined
 * - declared `middlewares` (if any) are an array of functions
 * - `children` (if any) is an array of valid `RouteDef`
 *
 * Useful for debugging, asserting test setups, or securing runtime module registration.
 *
 * @param input.routeDef - A route definition to validate.
 * @throws Error if any structural violation is found.
 *
 * @example
 * ```ts
 * validateRouteDef({ routeDef });
 * ```
 */
export const validateRouteDef = (input: { routeDef: RouteDef }): void => {
    const { routeDef } = input;

    // Validate path
    if (typeof routeDef.path !== 'string' || !routeDef.path.startsWith('/')) {
        throw new Error(`Invalid path "${routeDef.path}". Must be a string starting with '/'`);
    }

    // Validate factory presence and type
    if (!routeDef.factory || typeof routeDef.factory !== 'function') {
        throw new Error(`Missing or invalid factory in route "${routeDef.path}"`);
    }

    // Validate middlewares
    if (routeDef.middlewares !== undefined) {
        if (!Array.isArray(routeDef.middlewares)) {
            throw new Error(`Middlewares for "${routeDef.path}" must be an array`);
        }
        for (const mw of routeDef.middlewares) {
            if (typeof mw !== 'function') {
                throw new Error(`Invalid middleware in "${routeDef.path}". Must be functions`);
            }
        }
    }

    // Validate children
    if (routeDef.children !== undefined && !Array.isArray(routeDef.children)) {
        throw new Error(`Children in "${routeDef.path}" must be an array of RouteDef`);
    }
};
