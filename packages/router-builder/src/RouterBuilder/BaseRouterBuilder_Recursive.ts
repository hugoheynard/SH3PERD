import type {IAbstractRouterBuilder} from "../types/IAbstractRouterbuilder.js";
import type {Router} from "express";

import type {RouteDef} from "../types/types.js";

export class BaseRouterBuilder_Recursive implements IAbstractRouterBuilder {
    public async build(routeDefs: RouteDef[]): Promise<Router> {
        const router = Router();

        for (const def of routeDefs) {
            const result = def.factory ? await def.factory({}) : null;
            const subRouter = Router();

            if (result && 'routes' in result) {
                for (const [key, handlers] of Object.entries(result.routes)) {
                    const [method, path] = key.split(':');
                    subRouter[method.toLowerCase() as keyof Router](path, ...(handlers as RequestHandler[]));
                }
            }

            if (def.children) {
                const childRouter = await this.build(def.children);
                subRouter.use(childRouter);
            }

            router.use(def.path, subRouter);
        }

        return router;
    };
}