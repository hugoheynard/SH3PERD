import type {RequestHandler, Router} from 'express';
import type {MiddlewareFactory, RouteFactoryContext} from './types';

/**
 * Represents a declarative route definition in the application tree.
 * Each RouteDef maps to one Express Router instance.
 */
export interface RouteDef {
    /**
     * The relative path segment for this route.
     * Example: '/auth', '/users', '/dashboard'
     */
    path: `/${string}`;

    /**
     * A factory function that builds an Express Router for this route.
     * Receives the merged context (global + local inject).
     */
    factory: (input: { context : RouteFactoryContext}) => Router;

    /**
     * Context dependencies specific to this route.
     * These are merged manually with the parent context at runtime.
     */
    inject?: Partial<RouteFactoryContext>;

    /**
     * List of Express middlewares to apply only to this route.
     */
    middlewares?: MiddlewareEntry[];

    /**
     * Optional sub-routes (children) attached under this route.
     * Each child is mounted using `router.use(child.path, childRouter)`
     */
    children?: RouteDef[];
}
