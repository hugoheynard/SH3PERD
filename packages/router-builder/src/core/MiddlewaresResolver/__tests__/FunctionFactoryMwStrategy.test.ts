import {FunctionFactoryMwStrategy} from "../FunctionFactoryMwStrategy.js";
import type {NextFunction, Request, Response} from "express";
import {jest} from "@jest/globals";

describe("FunctionFactoryMwStrategy (autonome)", () => {
    let strategy: FunctionFactoryMwStrategy;

    beforeEach(() => {
        strategy = new FunctionFactoryMwStrategy();
    });

    it("should resolve middleware when all destructured deps are present", async () => {
        const factory = ({ suffix }: any) => {
            return (req: Request, res: Response, next:NextFunction): void => {
                (req as any).msg = suffix;
                next();
            };
        };

        strategy.setContext({ suffix: "ok!" });

        const resolved = await strategy.resolve(factory);
        const req: any = {};
        const res: any = {};
        const next = jest.fn();

        resolved(req, res, next);

        expect(req.msg).toBe("ok!");
        expect(next).toHaveBeenCalled();
    });

    it("should throw if destructured deps are missing in context", async () => {
        const factory = ({ suffix }: any) => (req: Request, res: Response, next:NextFunction) => next();

        strategy.setContext({}); // ❌ missing "suffix"

        await expect(strategy.resolve(factory)).rejects.toThrow(
            "Missing injected dependencies: suffix"
        );
    });

    it("should support destructuring with alias", async () => {
        const factory = ({ suffix: s }: any) => {
            return (req: Request, res: Response, next:NextFunction) => {
                (req as any).alias = s;
                next();
            };
        };

        strategy.setContext({ suffix: "aliased!" });

        const resolved = await strategy.resolve(factory);
        const req: any = {};
        const res: any = {};
        const next = jest.fn();

        resolved(req, res, next);

        expect(req.alias).toBe("aliased!");
        expect(next).toHaveBeenCalled();
    });

    it("should not fail if function does not use destructuring", async () => {
        const factory = (_deps: any) => (req: Request, res: Response, next:NextFunction) => next();

        strategy.setContext({});

        const resolved = await strategy.resolve(factory);
        expect(typeof resolved).toBe("function");
    });

    it("should validate multiple destructured deps", async () => {
        const factory = ({ suffix, mw }: any) => {
            return (req: Request, res: Response, next:NextFunction): void => {
                (req as any).suffix = suffix;
                mw.log("ok");
                next();
            };
        };

        strategy.setContext({
            suffix: "injected!",
            mw: { log: jest.fn() }
        });

        const resolved = await strategy.resolve(factory);
        const req: any = {};
        const res: any = {};
        const next = jest.fn();

        resolved(req, res, next);


        expect(req.suffix).toBe("injected!");
        expect(next).toHaveBeenCalled();
    });

});
