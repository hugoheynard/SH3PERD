import request from 'supertest';
import express, {type NextFunction, type Request, type RequestHandler, type Response, Router} from 'express';
import { POC_RecursiveRouterBuilder } from "../POC_RecursiveRouterBuilder.js";
import { defineModule } from "../../../infra/defineModule.js";
import type {MethodAndPath} from "../../../types/types.js";


describe('BaseRouterBuilder_Recursive - Basic integration', () => {

    it('baseCase : should serve response from /hello/', async () => {
        const helloModule = defineModule({
            path: "/hello",
            routes: () => ({
                "get:/": {
                    handler: (req, res) => res.send("Hello world!")
                }
            })
        });

        const builder = new POC_RecursiveRouterBuilder();
        const router = await builder.build({ routeDefs: [helloModule] });

        const app = express();
        app.use(router);

        // 🛡 Middlewares Express pour debugging
        app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
            console.error("🔥 Express caught error:", err.message);
            res.status(500).send("Internal Server Error");
        });

        app.use((req: Request, res: Response) => {
            console.warn("🧭 No route matched for:", req.method, req.url);
            res.status(404).send("Not Found");
        });

        try {
            const response = await request(app).get('/hello/');
            expect(response.status).toBe(200);
            expect(response.text).toBe('Hello world!');
        } catch (err) {
            console.error("💥 Request failed:", (err as Error).message);
            throw err;
        }
    });
});

describe("BaseRouterBuilder_Recursive - Advanced integration", () => {

    const childModule = defineModule({
        path: "/child",
        routes: () => ({
            "get:/": { handler: (req, res) => res.send("I am child") }
        })
    });

    const parentModule = defineModule({
        path: "/parent",
        children: [childModule],
        routes: () => ({})
    });

    const multiMethodModule = defineModule({
        path: "/multi",
        routes: () => ({
            "get:/": { handler: (req, res) => res.send("GET route") },
            "post:/": { handler: (req, res) => res.status(201).send("POST route") }
        })
    });

    const moduleWithMiddleware = defineModule({
        path: "/secure",
        routes: () => ({
            "get:/": {
                mw: [(req, res, next) => {
                    if (!req.headers.authorization) {
                        return res.status(401).send("Unauthorized");
                    }
                    return next();
                }],
                handler: (req, res) => res.send("Authorized!")
            }
        })
    });

    const brokenFactoryModule = {
        path: "/fail",
        factory: () => { throw new Error("Factory failed"); }
    };

    const buildApp = async (modules: any[]) => {
        const builder = new POC_RecursiveRouterBuilder();
        const router = await builder.build({ routeDefs: modules });
        const app = express();
        app.use(router);
        return app;
    };

    it("should serve child route", async () => {
        const app = await buildApp([parentModule]);
        const res = await request(app).get("/parent/child/");
        expect(res.status).toBe(200);
        expect(res.text).toBe("I am child");
    });

    it("should support multiple methods", async () => {
        const app = await buildApp([multiMethodModule]);
        expect((await request(app).get("/multi/")).text).toBe("GET route");
        expect((await request(app).post("/multi/")).status).toBe(201);
    });

    it("should return 401 without Authorization header", async () => {
        const app = await buildApp([moduleWithMiddleware]);
        const res = await request(app).get("/secure/");
        expect(res.status).toBe(401);
        expect(res.text).toBe("Unauthorized");
    });

    it("should return 200 with Authorization header", async () => {
        const app = await buildApp([moduleWithMiddleware]);
        const res = await request(app).get("/secure/").set("Authorization", "Bearer token");
        expect(res.status).toBe(200);
        expect(res.text).toBe("Authorized!");
    });

    it("should throw on broken factory", async () => {
        const builder = new POC_RecursiveRouterBuilder();
        await expect(builder.build({ routeDefs: [brokenFactoryModule as any] })).rejects.toThrow("Factory failed");
    });

    it("should throw on invalid handler array (raw type)", async () => {
        const builder = new POC_RecursiveRouterBuilder() as any;

        const fakeRouter = Router();
        const invalidRouteMap: Partial<Record<MethodAndPath, RequestHandler[]>> = {
            "get:/": [123 as any]
        };

        expect(() =>
            builder["registerRoutes"](fakeRouter, invalidRouteMap)
        ).toThrow("Invalid handler array");
    });





    it("should throw on unsupported HTTP method", async () => {
        const badMethodModule = defineModule({
            path: "/invalid",
            routes: () => ({
                "foo:/": { handler: (req: Request, res: Response) => res.send("nope") } as any
            })
        });

        const builder = new POC_RecursiveRouterBuilder();
        await expect(builder.build({ routeDefs: [badMethodModule] })).rejects.toThrow("Unsupported HTTP method");
    });
});