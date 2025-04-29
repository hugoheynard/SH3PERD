import type {RouteMap} from "../../../types/types.js";

const validHttpMethods:string[] = ["get", "post", "put", "patch", "delete", "options", "head"];

function isValidRouteKey(key: string): boolean {
    const [method, path] = key.split(":");
    return validHttpMethods.includes(method.toLowerCase()) && path.startsWith("/");
}

/**
 * Middleware to validate the keys of a RouteMap at runtime.
 *
 * Throws an error if a route key is invalid.
 */
export function validateRouteMap(routeMap: RouteMap): void {
    for (const key of Object.keys(routeMap)) {
        if (!isValidRouteKey(key)) {
            throw new Error(`Unsupported HTTP method: "${key}". Expected format: "<method>:/<path>".`);
        }
    }
}
