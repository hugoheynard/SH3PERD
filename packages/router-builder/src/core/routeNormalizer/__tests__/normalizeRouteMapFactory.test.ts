import type {RequestHandler} from "express";
import type {
    IAbstractMiddlewareResolver,
    RouteMap,
    TDeclarativeRoute,
    THttpMethod,
    TObjectRoute
} from "../../../types/types.js";
import {normalizeRouteMapFactory} from "../normalizeRouteMapFactory.js";
import { jest } from '@jest/globals';

describe("createRouteNormalizer (refactored version)", () => {
    const dummyHandler: RequestHandler = (req, res) => res.send("ok");
    const dummyMw: RequestHandler = (req, res, next) => next();

    const mockDefault = (method: THttpMethod, path: string) => dummyHandler;

    const buildFromObjectRouteFn = jest.fn(async () => [dummyMw, dummyHandler]);

    const normalize = normalizeRouteMapFactory({
        splitMethodPathFn: (key: string): [THttpMethod, string] => {
            const [method, path] = key.split(":") as [THttpMethod, string];
            return [method, path || "/"];
        },
        defaultHandlerFn: mockDefault,
        isHandlerFn: (val: TDeclarativeRoute): val is RequestHandler =>
            typeof val === "function",
        isHandlerArrayFn: (val: TDeclarativeRoute): val is RequestHandler[] =>
            Array.isArray(val) && typeof val[0] === "function",
        isObjectRouteFn: (val: TDeclarativeRoute): val is TObjectRoute =>
            typeof val === "object" &&
            val !== null &&
            ("handler" in val || "mw" in val),
        buildFromObjectRouteFn, // ✅ injectée préconfigurée, sans deps à part
        validateRouteMapFn: (routeMap: RouteMap): void => {}
    });

    it("should normalize a handler", async () => {
        const result = await normalize({ "get:/test": dummyHandler }, {});
        expect(result["get:/test"]).toEqual([dummyHandler]);
    });

    it("should normalize an array of handlers", async () => {
        const result = await normalize({ "get:/arr": [dummyHandler, dummyMw] }, {});
        expect(result["get:/arr"]).toEqual([dummyHandler, dummyMw]);
    });

    it("should use buildFromObjectRoute for object route", async () => {
        const route: TObjectRoute = { handler: dummyHandler, mw: [dummyMw] };
        const result = await normalize({ "get:/obj": route }, {});
        expect(buildFromObjectRouteFn).toHaveBeenCalled();
        expect(result["get:/obj"]).toEqual([dummyMw, dummyHandler]);
    });

    it("should fallback to default handler for unknown format", async () => {
        const result = await normalize(
            { "get:/x": null as unknown as TDeclarativeRoute },
            {}
        );
        expect(result["get:/x"]).toEqual([dummyHandler]);
    });
});
