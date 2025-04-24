import { Router } from 'express';
import type { IAbstractRouterBuilder, TRouterBuilderDependencies } from '../types/IAbstractRouterbuilder.js';
import { assertRequiredKeys } from '@sh3pherd/shared-utils';
import type {RouteDef} from "../types/types.js";


export class RouterBuilder implements IAbstractRouterBuilder {
    constructor(private readonly deps: TRouterBuilderDependencies) {
        assertRequiredKeys<TRouterBuilderDependencies>(
            deps,
            [
                'validateRouteDefFunction',
                'createContextFunction',
                'createRouterFromFactoryFunction',
                'resolveMiddlewaresFunction',
                'createRouterFromMapFunction'
            ],
            'RouterBuilder deps'
        );
    }

    public async build(input: { routeDefs: RouteDef[] }): Promise<Router> {
        const { routeDefs } = input;
        const rootRouter = Router();

        for (const def of routeDefs) {
            //this.deps.validateRouteDefFunction({ routeDef: def });

            const context = this.deps.createContextFunction({ routeDef: def });

            // Factory might return a Router OR { routes, mw }
            const result = def.factory ? def.factory(context) : null;

            const subRouter = Router();

            // 1. Global middlewares (from RouteDef)

            const globalMiddlewares = await this.deps.resolveMiddlewaresFunction({
                middlewares: def.middlewares ?? []
            });
            subRouter.use(...globalMiddlewares);

            // 2. Handle factory returning { routes, mw }
            if (result && typeof result === 'object' && 'routes' in result) {
                const routeLevelMiddlewares = await this.deps.resolveMiddlewaresFunction({
                    middlewares: result.mw ?? []
                });

                const routeRouter = this.deps.createRouterFromMapFunction(result.routes);
                routeRouter.use(...routeLevelMiddlewares);

                subRouter.use(routeRouter);
            }

            // 3. Or fallback to classic Router factory
            else if (result && typeof result.use === 'function') {
                subRouter.use(result);
            }

            // 4. Handle children recursively
            if (def.children) {
                const childRouter = await this.build({ routeDefs: def.children });
                subRouter.use(childRouter);
            }

            rootRouter.use(def.path, subRouter);
        }

        return rootRouter;
    };
}
