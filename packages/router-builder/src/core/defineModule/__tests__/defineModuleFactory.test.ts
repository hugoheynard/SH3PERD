import type { RequestHandler } from 'express';
import {defineModuleFactory} from "../defineModuleFactory.js";
import {jest} from "@jest/globals";

function isDeclarativeFactoryResult(val: unknown): val is { routes: any } {
    return typeof val === 'object' && val !== null && 'routes' in val;
}

describe('defineModuleFactory', () => {
    const dummyHandler: RequestHandler = (req, res) => res.send('hello');

    const normalizeRouteMapMock = jest.fn(async (routes, context) => {
        return { 'get:/': [dummyHandler] };
    });
    const defineModule = defineModuleFactory({ normalizeRouteMap: normalizeRouteMapMock });

    it('should return a valid RouteDef with factory using normalizeRouteMap', async () => {
        const module = defineModule<{ useCases: { helloHandler: RequestHandler } }>({
            path: '/hello',
            inject: {
                useCases: {
                    helloHandler: dummyHandler
                }
            },
            routes: ({ useCases }) => ({
                'get:/': {
                    handler: useCases.helloHandler
                }
            })
        });

        expect(module.path).toBe('/hello');
        expect(module.inject?.useCases.helloHandler).toBe(dummyHandler);
        expect(module.factory).toBeDefined();

        const result = await module.factory!({
            useCases: {
                helloHandler: dummyHandler
            }
        });

        expect(normalizeRouteMapMock).toHaveBeenCalledWith({
            'get:/': {
                handler: dummyHandler
            }
        }, {
            useCases: {
                helloHandler: dummyHandler
            }
        });

        if (isDeclarativeFactoryResult(result)) {
            expect(result.routes).toBeDefined();

            const routeEntry = result.routes['get:/'];

            expect(routeEntry).toBeDefined();

            if (Array.isArray(routeEntry)) {
                expect(routeEntry[0]).toBe(dummyHandler);
            } else {
                // fallback au cas où ce serait un unique handler
                expect(routeEntry).toBe(dummyHandler);
            }

        } else {
            throw new Error("Expected DeclarativeFactoryResult but got Router");
        }
    });

});