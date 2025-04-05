import { Router } from 'express';
import { RouteNode } from './RouteNode';
import type {Middleware, RouteFactoryContext, UseRouteParams} from './types';

export class RouteTree {
    private nodes: RouteNode[] = [];
    private context: RouteFactoryContext = {};
    private basePrefix = '';


    /**
     * Set the base prefix for all routes in this tree. e.g. '/api'.
     * @param prefix
     */
    prefix(prefix: string ): this {
        this.basePrefix = prefix;
        return this;
    };

    /**
     * Set the context for this tree. e.g. { db: dbConnection }.
     * @param input
     */
    withContext(input: { context: RouteFactoryContext }): this {
        this.context = input.context;
        return this;
    };

    /**
     * Add a route to the tree. e.g. '/users'.
     * @param path
     * @param factory
     * @param config
     * @param nested
     */
    use({ path, factory, config = {}, nested }: UseRouteParams): this {
        const node = new RouteNode({ path, factory, config });

        if (nested) {
            const nestedTree = new RouteTree().withContext({ context: this.context });
            nested(nestedTree);
            node.children.push(...nestedTree.nodes);
            return;
        }

        this.nodes.push(node);
        return this;
    };

    /**
     * Build the router for this tree.
     */
    build(): Router {
        if (!this.context || Object.keys(this.context).length === 0) {
            throw new Error('[RouteTree]: Missing context. Please call .withContext(...) before .build()');
        }

        const rootRouter = Router();
        for (const node of this.nodes) {
            const fullPath = this.basePrefix + node.path;
            const builtRouter = this._buildNode(node, this.context);
            rootRouter.use(fullPath, builtRouter);
        }
        return rootRouter;
    };

    /**
     * Build a node and its children.
     * @param node
     * @param parentCtx
     */
    private _buildNode(node: RouteNode, parentCtx: RouteFactoryContext): Router {
        const ctx = this._mergeContext(parentCtx, node.config.inject);
        const router = node.factory(ctx);

        for (const child of node.children) {
            const childRouter = this._buildNode(child, ctx);
            this._mountRouter({
                parent: router,
                path: child.path,
                router: childRouter,
                middlewares: child.config.middlewares
            });
        }

        return this._applyMiddlewares(router, node.config.middlewares);
    }

    /**
     * Merge the base context with the override context.
     * @param base
     * @param override
     */
    private _mergeContext(
        base: RouteFactoryContext,
        override?: Partial<RouteFactoryContext>
    ): RouteFactoryContext {
        return {
            ...base,
            ...(override || {})
        };
    }

    /**
     * Mount a child router to a parent router.
     * @param input
     */
    private _mountRouter(input: {
        parent: Router;
        path: string;
        router: Router;
        middlewares?: Middleware[];
    }) {
        const { parent, path, router, middlewares = [] } = input;

        // If middlewares are provided, wrap the router with them
        if (middlewares.length > 0) {
            parent.use(path, ...middlewares, router);
            return;
        }
        // If no middlewares, mount the router directly
        parent.use(path, router);
        return;
    };

    /**
     * Apply middlewares to a router.
     * @param router
     * @param middlewares
     */
    private _applyMiddlewares(router: Router, middlewares?: Middleware[]): Router {
        if (!middlewares || middlewares.length === 0) return router;

        const wrapped = Router();
        wrapped.use(...middlewares, router);
        return wrapped;
    };
}
