/**
 * Ensures the given RouteDef is valid.
 */
import type {RouteDef} from "../types/TRouteDef";

export const validateRouteDef = (input: { routeDef: RouteDef }): void => {
    const { routeDef } = input;
    
    if (!routeDef.path || !routeDef.path.startsWith('/')) {
        throw new Error(`Invalid path "${routeDef.path}". Must start with '/'`);
    }

    if (typeof routeDef.factory !== 'function') {
        throw new Error(`Missing factory in route "${routeDef.path}"`);
    }



    if (routeDef.middlewares && !Array.isArray(routeDef.middlewares)) {
        throw new Error(`Middlewares for "${routeDef.path}" must be an array`);
    }

    if (routeDef.middlewares) {
        for (const mw of routeDef.middlewares) {
            if (typeof mw !== 'function') {
                throw new Error(`Invalid middleware in "${routeDef.path}"`);
            }
        }
    }

    if (routeDef.children && !Array.isArray(routeDef.children)) {
        throw new Error(`Children in "${routeDef.path}" must be an array`);
    }
};