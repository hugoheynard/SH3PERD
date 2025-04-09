import {jest} from '@jest/globals';
import {Router} from "express";
import type {RouteDef} from "../../types/TRouteDef";
import {createRouterFromFactory} from "../createRouterFromFactory";


describe('createRouterFromFactory', () => {
    const dummyContext = { foo: 'bar' };

    it('should return a valid router when factory returns a Router', () => {
        const factoryMock = jest.fn(() => Router());

        const routeDef: RouteDef = {
            path: '/test',
            factory: factoryMock,
            inject: {},
            middlewares: [],
        };

        const result = createRouterFromFactory({
            routeDef,
            routeContext: dummyContext
        });

        expect(result).toBeDefined();
        expect(typeof result.use).toBe('function');
        expect(factoryMock).toHaveBeenCalledWith({ context: dummyContext });
    });

    it('should throw an error if factory returns undefined', () => {
        const routeDef: RouteDef = {
            path: '/fail',
            factory: () => undefined as any,
            inject: {},
            middlewares: [],
        };

        expect(() => createRouterFromFactory({ routeDef, routeContext: dummyContext }))
            .toThrow('Factory in route "/fail" did not return a valid Router');
    });

    it('should throw an error if factory returns an object without "use"', () => {
        const routeDef: RouteDef = {
            path: '/fail2',
            factory: () => ({ notARealRouter: true }) as any,
            inject: {},
            middlewares: [],
        };

        expect(() => createRouterFromFactory({ routeDef, routeContext: dummyContext }))
            .toThrow('Factory in route "/fail2" did not return a valid Router');
    });
});
