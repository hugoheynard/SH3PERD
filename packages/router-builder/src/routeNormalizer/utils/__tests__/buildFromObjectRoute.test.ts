import type { RequestHandler } from 'express';
import type {IAbstractMiddlewareResolver} from "../../../types/types.js";
import {jest} from '@jest/globals';
import {buildFromObjectRouteFactory} from "../buildFromObjectRouteFactory.js";


describe('buildFromObjectRoute (via factory)', () => {
    const defaultHandler: RequestHandler = (req, res) => res.send('default');
    const mockDefault = (method: string, path: string) => defaultHandler;

    const dummyMw: RequestHandler = (req, res, next) => next();
    const handler: RequestHandler = (req, res) => res.send('handler');

    const mwResolver: IAbstractMiddlewareResolver = {
        setContext: jest.fn(),
        resolveAll: jest.fn(async (entries: unknown[]) => entries as RequestHandler[])
    };

    const splitMethodPathFn = (key: string): [string, string] => {
        const [method, ...path] = key.split(':');
        return [method, `/${path.join(':')}`];
    };

    const buildFromObjectRoute = buildFromObjectRouteFactory({
        splitMethodPathFn,
        mwResolver,
        defaultHandlerFn: mockDefault
    });

    it('should build route with handler and middlewares', async () => {
        const result = await buildFromObjectRoute({
            key: 'get:/hello',
            routeObject: {
                mw: [dummyMw],
                handler
            },
            context: { suffix: 'ok' }
        });

        expect(result).toEqual([dummyMw, handler]);
        expect(mwResolver.setContext).toHaveBeenCalledWith({ suffix: 'ok' });
        expect(mwResolver.resolveAll).toHaveBeenCalledWith([dummyMw]);
    });

    it('should fallback to default handler if none provided', async () => {
        const result = await buildFromObjectRoute({
            key: 'get:/fallback',
            routeObject: {
                mw: []
            },
            context: {}
        });

        expect(result).toEqual([defaultHandler]);
    });
});

