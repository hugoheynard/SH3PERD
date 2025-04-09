import {Router} from "express";
import type {IAbstractRouterBuilder, TRouterBuilderDependencies} from "./types/IAbstractRouterbuilder";
import {assertRequiredKeys} from "@sh3pherd/shared-utils";
import type {RouteDef} from "./types/TRouteDef";
import {resolveMiddlewares} from "./utils/resolveMiddlewares";


/**
 * Builds an Express Router recursively from a declarative tree of `RouteDef` objects.
 *
 * This class follows a **functional and composable architecture**:
 * - Each route receives only its own injected dependencies (`inject`)
 * - Middlewares can be declared and resolved per route with full support for:
 *   - Plain RequestHandlers
 *   - Injected dependencies (`withDeps`)
 *   - Asynchronous middleware factories (`async: true`)
 * - Children routes are recursively built and mounted under their parent
 *
 * Promotes a clean architecture by:
 * - Avoiding shared or global state
 * - Making all dependencies explicit and scoped
 * - Structuring routes hierarchically for scalability
 * - Supporting middleware resolution lifecycle independently of routing logic
 *
 * Example usage:
 *
 * ```ts
 * const builder = new RouterBuilder({
 *   validateRouteDefFunction,
 *   createContextFunction,
 *   createRouterFromFactoryFunction,
 * });
 *
 * const router = await builder.build({
 *   routeDefs: [
 *     {
 *       path: '/users',
 *       inject: { getUsers: new GetUsersUseCase(repo) },
 *       middlewares: [
 *         authMiddleware,
 *         {
 *           withDeps: true,
 *           async: true,
 *           deps: { logger },
 *           mw: async ({ logger }) => {
 *             return (req, res, next) => {
 *               logger.log(`Accessed /users`);
 *               next();
 *             };
 *           }
 *         }
 *       ],
 *       factory: ({ getUsers }) => {
 *         const r = Router();
 *         r.get('/', async (req, res) => {
 *           const users = await getUsers.execute();
 *           res.json(users);
 *         });
 *         return r;
 *       },
 *       children: [
 *         {
 *           path: '/me',
 *           factory: () => {
 *             const r = Router();
 *             r.get('/', handler);
 *             return r;
 *           }
 *         }
 *       ]
 *     }
 *   ]
 * });
 *
 * app.use('/api', router);
 * ```
 *
 * @param routeDefs - The list of route definitions to compose into an Express router.
 * @returns A `Promise<Router>` – the Express router instance with all routes and middlewares composed and mounted.
 */

export class RouterBuilder implements IAbstractRouterBuilder {
    constructor(private readonly deps: TRouterBuilderDependencies) {
        //prevents js runtime errors
        assertRequiredKeys<TRouterBuilderDependencies>(
            deps,
            [
            'validateRouteDefFunction',
            'createContextFunction',
            'createRouterFromFactoryFunction',
        ],
            'RouterBuilder deps')
        this.deps = deps;
    };

    public build(input: { routeDefs: RouteDef[] }): Router {
        const { routeDefs } = input;
        const rootRouter = Router();

        for (const def of routeDefs) {
            // Ensure the route definition is valid
            this.deps.validateRouteDefFunction({ routeDef : def });

            // Ensure the context is created for this route
            const context = this.deps.createContextFunction({ routeDef: def });
            const router = this.deps.createRouterFromFactoryFunction({ routeDef: def, routeContext: context });

            const middlewares = await resolveMiddlewares(def.middlewares ?? []);
            middlewares.forEach(mw => router.use(mw));

            // No parent context propagation — children must inject everything they need
            const children  = def.children ?? [];

            if (children !== undefined && !Array.isArray(children)) {
                throw new Error(`Children in "${def.path}" must be an array`);
            }

            const childRouter = this.build({ routeDefs: children });
            router.use(childRouter);

            //mount the route
            rootRouter.use(routeDef.path, router);
        }
        return rootRouter;
    };
}
