import type {RequestHandler} from "express";
import {resolveMiddlewares} from "../resolveMiddlewares";
import type {MiddlewareEntry} from "../../types/types";



describe('resolveMiddlewares', () => {
    const makeHandler = (label: string): RequestHandler => {
        return (_req, _res, next) => {
            console.log(`called: ${label}`);
            next();
        };
    };


    it('should return static middlewares unchanged', async () => {
        const mw1 = makeHandler('static');
        const resolved = await resolveMiddlewares({ middlewares: [mw1] });
        expect(resolved).toHaveLength(1);
        expect(resolved[0]).toBe(mw1);
    });

    it('should resolve middleware with deps (sync)', async () => {
        const deps = { message: 'Hello' };
        const entry: MiddlewareEntry = {
            withDeps: true,
            deps,
            async: false,
            mw: (deps) => makeHandler(deps.message)
        };

        const resolved = await resolveMiddlewares({ middlewares: [entry] });
        expect(typeof resolved[0]).toBe('function');
    });

    it('should resolve middleware with deps (async)', async () => {
        const deps = { label: 'AsyncMW' };
        const entry: MiddlewareEntry = {
            withDeps: true,
            deps,
            async: true,
            mw: async (deps) => {
                await new Promise((res) => setTimeout(res, 10));
                return makeHandler(deps.label);
            }
        };

        const resolved = await resolveMiddlewares({ middlewares: [entry] });
        expect(typeof resolved[0]).toBe('function');
    });

    it('should throw on invalid entry', async () => {
        const badEntry = { notMiddleware: true } as unknown as MiddlewareEntry;
        await expect(
            resolveMiddlewares({ middlewares: [badEntry] })
        ).rejects.toThrow('Invalid middleware entry');    });
});
