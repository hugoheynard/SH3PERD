import { Router, type RequestHandler } from "express";
import type { IAbstractRouterBuilder } from "../../types/IAbstractRouterbuilder.js";
import type { MethodAndPath, RouteDef, THttpMethod } from "../../types/types.js";
import {RouterLifecycleHooks} from "./RouterLifecycleHooks.js";


export class HookableRouterBuilder implements IAbstractRouterBuilder {
    constructor(private lifecycleHooks: RouterLifecycleHooks = new RouterLifecycleHooks()) {};

    public async build(input: { routeDefs: RouteDef[] }): Promise<Router> {
        const router = Router();

        for (const def of input.routeDefs) {
            const subRouter = Router();

            // 🔥 1. Hook before validate / factory
            await this.lifecycleHooks.runHooks("beforeValidate", def);

            // 🔥 2. Factory
            const result = def.factory ? await def.factory({}) : null;

            if (result && typeof result === "object" && "routes" in result) {
                // 🔥 3. Hook before registering routes
                await this.lifecycleHooks.runHooks("beforeRegister", def);

                this.registerRoutes(subRouter, result.routes);
            }

            // 🔥 4. Hook before recursion
            await this.lifecycleHooks.runHooks("beforeChildren", def);

            if (Array.isArray(def.children) && def.children.length > 0) {
                const childRouter = await this.build({ routeDefs: def.children });
                subRouter.use(childRouter);
            }

            // 🔥 5. (Optional) Hook before mount
            await this.lifecycleHooks.runHooks("beforeMount", def);

            // 6. Mount subRouter
            router.use(def.path, subRouter);
        }

        return router;
    }

    private registerRoutes(
        router: ReturnType<typeof Router>,
        routeMap: Partial<Record<MethodAndPath, RequestHandler | RequestHandler[]>>
    ): void {
        for (const [key, raw] of Object.entries(routeMap)) {
            const [rawMethod, rawPath] = key.split(":");
            const method = rawMethod.toLowerCase() as THttpMethod;
            const path = rawPath || "/";

            const handlers = Array.isArray(raw) ? raw : [raw];

            if (!handlers.every(h => typeof h === "function")) {
                throw new Error(`Invalid handler array for route "${key}"`);
            }

            if (typeof router.route(path)[method] !== "function") {
                throw new Error(`Unsupported HTTP method "${method}" for route "${key}"`);
            }
            

            router.route(path)[method](...handlers);
        }
    }
}
