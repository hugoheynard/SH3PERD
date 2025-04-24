import type {NextFunction, Request, Response} from 'express';
import {defaultHandler_makeRouteWorks} from "../defaultHandler_makeRouteWorks.js";
import {jest} from '@jest/globals';

describe('defaultHandler_makeRouteWorks', () => {
    it('should return a RequestHandler that responds with route info', () => {
        const req = {} as Request;
        const json = jest.fn();
        const res = { json } as unknown as Response;
        const next = jest.fn() as NextFunction;

        const handler = defaultHandler_makeRouteWorks('get', '/test');
        handler(req, res, next);

        expect(json).toHaveBeenCalledWith({ message: 'Route "GET /test" works' });
    });

    it('should uppercase the method in the response', () => {
        const req = {} as Request;
        const json = jest.fn();
        const res = { json } as unknown as Response;
        const next = jest.fn() as NextFunction;

        const handler = defaultHandler_makeRouteWorks('post', '/hello');
        handler(req, res, next);

        expect(json).toHaveBeenCalledWith({ message: 'Route "POST /hello" works' });
    });
});
