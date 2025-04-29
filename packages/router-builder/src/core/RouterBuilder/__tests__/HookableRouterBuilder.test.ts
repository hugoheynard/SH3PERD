import {RouterLifecycleHooks} from "../RouterLifecycleHooks.js";
import {HookableRouterBuilder} from "../HookableRouterBuilder.js";
import type {RouteDef} from "../../../types/types.js";
import {type Request, type Response, Router} from "express";
import request from "supertest";

describe("HookableRouterBuilder", () => {
    let lifecycleHooks: RouterLifecycleHooks;
    let builder: HookableRouterBuilder;
    let fakeRoute: RouteDef;

    beforeEach(() => {
        lifecycleHooks = new RouterLifecycleHooks();
        builder = new HookableRouterBuilder(lifecycleHooks);

        fakeRoute = {
            path: "/test",
            factory: async () => ({
                routes: {
                    "GET:/": [(req: Request, res: Response) => res.send("Hello World")],
                }
            }),
            children: []
        };
    });

    it("should call lifecycle hooks in correct order", async () => {
        const callOrder: string[] = [];

        lifecycleHooks
            .useBeforeValidate((route) => {
                callOrder.push("beforeValidate");
            })
            .useBeforeRegister((route) => {
                callOrder.push("beforeRegister");
            })
            .useBeforeChildren((route) => {
                callOrder.push("beforeChildren");
            })
            .useBeforeMount((route) => {
                callOrder.push("beforeMount");
            });

        const router = await builder.build({ routeDefs: [fakeRoute] });

        expect(typeof router).toBe("function");
        expect(router).toHaveProperty("use");
        expect(typeof router.use).toBe("function");

        expect(callOrder).toEqual([
            "beforeValidate",
            "beforeRegister",
            "beforeChildren",
            "beforeMount",
        ]);
    });

    it("should correctly build nested child routers", async () => {
        const childRoute: RouteDef = {
            path: "/child",
            factory: async () => ({
                routes: {
                    "GET:/": [(req: Request, res: Response) => res.send("Child Route")]
                }
            }),
            children: []
        };

        const parentRoute: RouteDef = {
            path: "/parent",
            factory: async () => ({
                routes: {
                    "GET:/": [(req: Request, res: Response) => res.send("Parent Route")]
                }
            }),
            children: [childRoute]
        };

        const router = await builder.build({ routeDefs: [parentRoute] });

        expect(typeof router).toBe("function");
        expect(router).toHaveProperty("use");

    });
});
