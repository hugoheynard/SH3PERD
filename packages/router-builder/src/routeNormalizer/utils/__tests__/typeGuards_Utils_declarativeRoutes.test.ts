import type { RequestHandler } from 'express';
import {isHandler, isHandlerArray, isObjectRoute, splitMethodPath} from "../typeGuards_Utils_declarativeRoutes.js";

describe('typeGuards', () => {
    const dummyHandler: RequestHandler = (req, res) => res.send('ok');

    test('isHandler should detect a single handler', () => {
        expect(isHandler(dummyHandler)).toBe(true);
        expect(isHandler(123)).toBe(false);
        expect(isHandler(null)).toBe(false);
    });

    test('isHandlerArray should detect array of handlers', () => {
        expect(isHandlerArray([dummyHandler, dummyHandler])).toBe(true);
        expect(isHandlerArray([dummyHandler, 123])).toBe(false);
        expect(isHandlerArray('not an array')).toBe(false);
    });

    test('isObjectRoute should detect object route format', () => {
        expect(isObjectRoute({ handler: dummyHandler })).toBe(true);
        expect(isObjectRoute({ mw: [dummyHandler] })).toBe(true);
        expect(isObjectRoute({})).toBe(false);
        expect(isObjectRoute(null)).toBe(false);
        expect(isObjectRoute(123)).toBe(false);
    });

    test('splitMethodPath should split method and path correctly', () => {
        expect(splitMethodPath('get:/hello')).toEqual(['get', '/hello']);
        expect(splitMethodPath('POST:/api')).toEqual(['POST', '/api']);
        expect(splitMethodPath('delete')).toEqual(['delete', '/']);
    });

    test('isHandlerArray with deeply nested mixed array', () => {
        const mixedArray: unknown = [dummyHandler, [dummyHandler], 42];
        expect(isHandlerArray(mixedArray)).toBe(false);
    });

    test('isObjectRoute with misleading structure', () => {
        const trickyObj = { handler: undefined, mw: undefined };
        expect(isObjectRoute(trickyObj)).toBe(false);

        const fakeHandlerKey = { handler: 'not a function' };
        expect(isObjectRoute(fakeHandlerKey)).toBe(false);
    });


    test('splitMethodPath with malformed input', () => {
        expect(splitMethodPath(':::')).toEqual(['', '::']);
        expect(splitMethodPath(':pathOnly')).toEqual(['', 'pathOnly']);
        expect(splitMethodPath('get:/path/with:colon')).toEqual(['get', '/path/with:colon']);
    });

});
