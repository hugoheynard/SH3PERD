import type {Request, RequestHandler, Response} from "express";


/**
 * Default route handler used as a placeholder when no explicit handler is defined.
 *
 * This utility is primarily useful in development environments or during scaffolding phases,
 * where routes are defined but not yet implemented. It allows the system to remain operable
 * and signals to developers or consumers that the route is reachable and functioning at the HTTP level.
 *
 * @param method - The HTTP method (e.g., "get", "post") associated with the route.
 * @param fullPath - The complete path of the route, typically in the format "/resource".
 *
 * @returns An Express `RequestHandler` that responds with a JSON message confirming route activation.
 *
 * @example
 * ```ts
 * const handler = defaultHandler_makeRouteWorks("get", "/users");
 * app.get("/users", handler);
 * // Response: { message: 'Route "GET /users" works' }
 * ```
 */
export const defaultHandler_makeRouteWorks = (method: string, fullPath: string): RequestHandler => {
    return (req: Request, res: Response): void => {
        res.json({message: `Route "${method.toUpperCase()} ${fullPath}" works`});
    };
};