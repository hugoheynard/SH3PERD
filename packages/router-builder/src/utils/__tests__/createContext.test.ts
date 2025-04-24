import type { RouteDef } from "../../types/types.js";
import {createContext} from "../createContext.js";

describe("createContext", () => {
    it("should return the inject context if present", () => {
        const routeDef: RouteDef<{ config: { debug: true } }> = {
            path: "/example",
            inject: {
                config: { debug: true }
            }
        };

        const context = createContext<{ config: { debug: true } }>({ routeDef });
        expect(context).toEqual({ config: { debug: true } });
    });

    it("should return an empty object if no inject is present", () => {
        const routeDef: RouteDef = {
            path: "/no-inject"
        };

        const context = createContext({ routeDef });
        expect(context).toEqual({});
    });
});
