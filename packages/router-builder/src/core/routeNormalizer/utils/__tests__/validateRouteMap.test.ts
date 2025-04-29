import type { RequestHandler } from "express";
import type {RouteMap} from "../../../../types/types";
import {validateRouteMap} from "../validateRouteMap";

describe("validateRouteMap", () => {
    const dummyHandler: RequestHandler = (req, res) => res.send("OK");

    it("should pass for a valid RouteMap", () => {
        const validRouteMap: RouteMap = {
            "get:/users": [dummyHandler],
            "post:/login": [dummyHandler]
        };

        expect(() => validateRouteMap(validRouteMap)).not.toThrow();
    });

    it("should throw for invalid method in RouteMap", () => {
        const invalidRouteMap = {
            "fetch:/users": [dummyHandler], // mauvais method
        } as unknown as RouteMap;

        expect(() => validateRouteMap(invalidRouteMap)).toThrow(
            'Unsupported HTTP method: "fetch:/users". Expected format: "<method>:/<path>".'
        );
    });

    it("should be case insensitive for methods", () => {
        const mixedCaseRouteMap = {
            "PoSt:/register": [dummyHandler],
        } as unknown as RouteMap;

        expect(() => validateRouteMap(mixedCaseRouteMap)).not.toThrow();
    });

});
