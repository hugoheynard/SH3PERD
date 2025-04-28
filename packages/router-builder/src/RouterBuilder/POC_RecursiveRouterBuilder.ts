import { Router, type RequestHandler } from "express";
import type { IAbstractRouterBuilder } from "../types/IAbstractRouterbuilder.js";
import type {MethodAndPath, RouteDef, THttpMethod} from "../types/types.js";

/**
 * POCRouterBuilder — minimalist implementation for `defineModule()` routing.
 *
 * This builder is meant as a Proof of Concept to validate the modular router design,
 * including route normalization and recursive composition.
 */
export class POC_RecursiveRouterBuilder implements IAbstractRouterBuilder {
    public async build(input: { routeDefs: RouteDef[] }): Promise<Router> {
        const router = Router();

        for (const def of input.routeDefs) {
            const subRouter = Router();

            // 1. Build routes from factory if present
            const result = def.factory ? await def.factory({}) : null;

            if (result && typeof result === "object" && "routes" in result) {
                this.registerRoutes(subRouter, result.routes);
            }

            // 2. Recursively build children
            if (Array.isArray(def.children) && def.children.length > 0) {
                const childRouter = await this.build({ routeDefs: def.children });
                subRouter.use(childRouter);
            }

            // 3. Mount sub-router under the module path
            router.use(def.path, subRouter);
        }

        return router;
    };

    /**
     * Registers route handlers into the provided Express router.
     *
     * @param router - The Express sub-router to populate
     * @param routeMap - A record of method:path to handler arrays
     */
    private registerRoutes(
        router: Router,
        routeMap: Partial<Record<MethodAndPath, RequestHandler | RequestHandler[]>>
    ): void {
        for (const [key, raw] of Object.entries(routeMap)) {
            const split = key.split(":");
            if (split.length !== 2) {
                throw new Error(`Invalid route key "${key}". Expected format "METHOD:/path"`);
            }

            const [rawMethod, rawPath] = split;
            const method = rawMethod.toLowerCase() as THttpMethod;
            const path = rawPath || "/";

            const handlers = Array.isArray(raw) ? raw : [raw];

            if (!handlers.every(h => typeof h === "function")) {
                throw new Error(`Invalid handler array for route "${key}"`);
            }

            // ⛔ On vérifie le support du method **avant** l'appel route()
            const methodExists = typeof router.route(path)[method] === "function";
            if (!methodExists) {
                throw new Error(`Unsupported HTTP method "${method}" for route "${key}"`);
            }

            router.route(path)[method](...handlers);
        }
    };
}
