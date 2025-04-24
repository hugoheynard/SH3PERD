import type {RequestHandler} from "express";
import {defineModule} from "../defineModule.js";
import type {RouteFactoryContext} from "../../types/types.js";
import { jest } from "@jest/globals";

function isDeclarativeFactoryResult(val: unknown): val is { routes: any } {
    return typeof val === 'object' && val !== null && 'routes' in val;
}

describe("defineModule", () => {
    describe("defineModule - base case", () => {
        const handler: RequestHandler = (req, res) => res.send("Hello");

        it("should resolve a single route with a direct handler", async () => {
            const module = defineModule({
                path: "/base",
                inject: {},
                routes: () => ({
                    "get:/": handler
                })
            });

            const factoryResult = await module.factory?.({} as RouteFactoryContext);

            expect(isDeclarativeFactoryResult(factoryResult)).toBe(true);

            if (isDeclarativeFactoryResult(factoryResult)) {
                const route = factoryResult.routes["get:/"];
                expect(route).toBeDefined();
                expect(route).toHaveLength(1);
                expect(route?.[0]).toBe(handler);
            }
        });
    });

    describe("defineModule integration", () => {
        const dummyMw: RequestHandler = (req, res, next) => next();
        const dummyHandler: RequestHandler = (req, res) => res.send("OK");

        const injectedService = {
            listUsers: jest.fn(dummyHandler)
        };



        it("should normalize routes with handler and middlewares", async () => {
            const userModule = defineModule({
                path: "/users",
                inject: { userService: injectedService },
                routes: ({ userService }) => ({
                    "get:/": {
                        mw: [dummyMw],
                        handler: userService.listUsers
                    }
                })
            });

            const factoryResult = await userModule.factory?.({ userService: injectedService } as RouteFactoryContext);

            expect(isDeclarativeFactoryResult(factoryResult)).toBe(true);

            if (isDeclarativeFactoryResult(factoryResult)) {
                expect(factoryResult.routes).toBeDefined();
                expect(factoryResult.routes["get:/"]).toHaveLength(2);
                expect(factoryResult.routes["get:/"][1]).toBe(injectedService.listUsers);
            }
        });


        it("should fallback to default handler if none provided", async () => {
            const module = defineModule({
                path: "/empty",
                inject: {},
                routes: () => ({
                    "get:/": {} // no handler
                })
            });

            const factoryResult = await module.factory?.({} as RouteFactoryContext);

            expect(isDeclarativeFactoryResult(factoryResult)).toBe(true);

            if (isDeclarativeFactoryResult(factoryResult)) {
                expect(factoryResult.routes["get:/"]).toHaveLength(1); // default handler only
            }
        });
    });
});

