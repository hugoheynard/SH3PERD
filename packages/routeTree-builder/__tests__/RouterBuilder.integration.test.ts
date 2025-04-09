import express from "express";
import request from "supertest";
import type {Request, Response} from "express";
import {RouterBuilder} from "../src/RouterBuilder";
import {validateRouteDef} from "../src/utils/validateRouteDef";
import {createRouterFromFactory} from "../src/utils/createRouterFromFactory";
import {mountRoute} from "../src/utils/mountRoute";
import {createContext} from "../src/utils/createContext";


describe('Integration - RouterBuilder', () => {
    it('should handle a full request flow', async () => {
        const routeDefs = [
            {
                path: '/test' as `/${string}`,
                factory: () => {
                    const router = express.Router();
                    router.get('/', (_req: Request, res: Response) => res.send('OK'));
                    return router;
                }
            }
        ];

        const builder = new RouterBuilder({
            validateRouteDefFunction: validateRouteDef,
            createContextFunction: createContext,
            createRouterFromFactoryFunction: createRouterFromFactory,
            mountRouteFunction: mountRoute
        });

        const app = express();
        app.use(builder.build({ routeDefs }));

        const res = await request(app).get('/test');
        expect(res.status).toBe(200);
        expect(res.text).toBe('OK');
    });
});
