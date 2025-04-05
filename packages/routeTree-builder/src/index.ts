// Entry point for @sh3pherd/routeTree-builder

import {RouteTree} from "./v1 of failure/RouteTree";


const createAuthRouter = () => {

    return new RouteTree()
        .prefix('/auth')
        .withContext({ context: { test: 'test' } })
        .use({
            path: '/test2',
            factory: (ctx) => {
                console.log(ctx);
                return {
                    get: (req, res) => res.send('test2')
                }
            },
            config: {
                middlewares: [],
                inject: {
                    test: 'test'
                }
            },
            nested: () => {},

        })

};




