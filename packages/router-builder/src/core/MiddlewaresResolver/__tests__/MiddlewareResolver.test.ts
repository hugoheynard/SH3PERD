import type {NextFunction, Request, RequestHandler, Response} from "express";
import {MiddlewareResolver} from "../MiddlewareResolver.js";
import {ClassicMiddlewareStrategy} from "../ClassicMwStrategy.js";
import {FunctionFactoryMwStrategy} from "../FunctionFactoryMwStrategy.js";
import { jest } from "@jest/globals";
import {type TMiddlewareEntry} from "../../../types/types";


describe("MiddlewareResolver", () => {
    let resolver: MiddlewareResolver;

    beforeEach(() => {
        resolver = new MiddlewareResolver([
            new ClassicMiddlewareStrategy(),
            new FunctionFactoryMwStrategy()
        ]);
    });

    it("should resolve a classic middleware", async () => {
        const simpleMw: RequestHandler = (req: Request, res: Response, next: NextFunction): void => {
            (req as any).classic = true;
            next();
        };

        const result = await resolver.resolveAll([simpleMw]);

        const req: any = {};
        const res: any = {};
        const next = jest.fn();

        result[0](req, res, next);

        expect(req.classic).toBe(true);
        expect(next).toHaveBeenCalled();
    });

    it("should resolve a factory middleware with context", async () => {
        const factory = ({ suffix }: Record<string, unknown>) => {
            return (req: Request, res: Response, next: NextFunction):void => {
                (req as any).suffix = suffix;
                next();
            };
        };

        const strategy = new FunctionFactoryMwStrategy();
        strategy.setContext({ suffix: "ok!" });

        const handler = await strategy.resolve(factory);

        const req: any = {};
        const res: any = {};
        const next = jest.fn();

        handler(req, res, next);

        expect(req.suffix).toBe("ok!");
        expect(next).toHaveBeenCalled();
    });


    it("should throw if a factory middleware requires missing deps", async () => {
        const factory = ({ suffix }: any) => {
            // on utilise suffix
            return (req: Request, res: Response, next: NextFunction) => {
                (req as any).x = suffix;
                next();
            };
        };

        const strategy = new FunctionFactoryMwStrategy();
        strategy.setContext({}); // ❌ suffix manquant

        const resolver = new MiddlewareResolver([
            new ClassicMiddlewareStrategy(),
            strategy
        ]);



        await expect(resolver.resolveAll([factory])).rejects.toThrow(
            "Missing injected dependencies: suffix"
        );
    });



    it("should throw for unsupported middleware type", async () => {
        const invalidEntry = 42 as unknown as TMiddlewareEntry;

        await expect(resolver.resolveAll([invalidEntry])).rejects.toThrow(
            "Unsupported middleware entry"
        );
    });
});
