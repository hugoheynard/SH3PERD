import {RouterLifecycleHooks} from "../RouterLifecycleHooks.js";
import type {RouteDef} from "../../types/types.js";
import { jest} from "@jest/globals";

describe("RouterLifecycleHooks", () => {
    let lifecycle: RouterLifecycleHooks;
    let fakeRoute: RouteDef;

    beforeEach(() => {
        lifecycle = new RouterLifecycleHooks();
        fakeRoute = { path: "/test" } as RouteDef; // Typage rapide
    });

    it("should register and run a single hook", async () => {
        const mockFn = jest.fn<(route: RouteDef) => void>();


        lifecycle.useBeforeValidate(mockFn);

        await lifecycle.runHooks("beforeValidate", fakeRoute);

        expect(mockFn).toHaveBeenCalledTimes(1);
        expect(mockFn).toHaveBeenCalledWith(fakeRoute);
    });

    it("should register and run multiple hooks", async () => {
        const mockFn1 = jest.fn<(route: RouteDef) => void>();
        const mockFn2 = jest.fn<(route: RouteDef) => void>();

        lifecycle.useBeforeValidate([mockFn1, mockFn2]);

        await lifecycle.runHooks("beforeValidate", fakeRoute);

        expect(mockFn1).toHaveBeenCalledTimes(1);
        expect(mockFn2).toHaveBeenCalledTimes(1);
        expect(mockFn1).toHaveBeenCalledWith(fakeRoute);
        expect(mockFn2).toHaveBeenCalledWith(fakeRoute);
    });

    it("should execute hooks in the correct order", async () => {
        const callOrder: string[] = [];

        const hook1 = async () => { callOrder.push("first"); };
        const hook2 = async () => { callOrder.push("second"); };

        lifecycle.useBeforeValidate([hook1, hook2]);

        await lifecycle.runHooks("beforeValidate", fakeRoute);

        expect(callOrder).toEqual(["first", "second"]);
    });

    it("should allow method chaining", () => {
        const chain = lifecycle
            .useBeforeValidate(() => {})
            .useBeforeRegister(() => {})
            .useBeforeChildren(() => {})
            .useBeforeMount(() => {});

        expect(chain).toBe(lifecycle); // Chaining works: returns itself
    });
});
