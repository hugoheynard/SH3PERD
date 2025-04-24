import type { RequestHandler } from "express";
import {ClassicMiddlewareStrategy} from "../ClassicMwStrategy.js";

describe('ClassicMiddlewareStrategy', () => {
    const strategy = new ClassicMiddlewareStrategy();

    it('should support Express-style functions', () => {
        const mw: RequestHandler = (req, res, next) => next();
        expect(strategy.supports(mw)).toBe(true);
    });

    it('should not support non-function values', () => {
        expect(strategy.supports(undefined)).toBe(false);
        expect(strategy.supports(null)).toBe(false);
        expect(strategy.supports({})).toBe(false);
        expect(strategy.supports("not a function")).toBe(false);
        expect(strategy.supports(42)).toBe(false);
    });

    it('should resolve and return the same middleware function', async () => {
        const mw: RequestHandler = (req, res, next) => next();
        const result = await strategy.resolve(mw);
        expect(result).toBe(mw); // 🧪 exactement la même fonction
    });
});
