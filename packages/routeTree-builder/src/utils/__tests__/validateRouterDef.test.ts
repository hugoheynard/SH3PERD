import type {RouteDef} from "../../types/TRouteDef";
import {validateRouteDef} from "../validateRouteDef";
import express from "express";


describe('validateRouteDef', () => {
    const validFactory = () => express.Router();

    it('should not throw for a valid route def', () => {
        const route: RouteDef = {
            path: '/users',
            factory: validFactory
        };
        expect(() => validateRouteDef({ routeDef: route })).not.toThrow();
    });

    it('should throw if path is missing or does not start with "/"', () => {
        const route: any = {
            path: 'invalid',
            factory: validFactory
        };
        expect(() => validateRouteDef({ routeDef: route })).toThrow(/Invalid path/);
    });

    it('should throw if factory is missing', () => {
        const route: any = {
            path: '/missing-factory'
        };
        expect(() => validateRouteDef({ routeDef: route })).toThrow(/Missing factory/);
    });

    it('should throw if middlewares is not an array', () => {
        const route: any = {
            path: '/bad-middlewares',
            factory: validFactory,
            middlewares: 'not-an-array'
        };
        expect(() => validateRouteDef({ routeDef: route })).toThrow(/must be an array/);
    });

    it('should throw if a middleware is not a function', () => {
        const route: any = {
            path: '/invalid-middleware',
            factory: validFactory,
            middlewares: [() => {}, 123]
        };
        expect(() => validateRouteDef({ routeDef: route })).toThrow(/Invalid middleware/);
    });

    it('should throw if children is not an array', () => {
        const route: any = {
            path: '/bad-children',
            factory: validFactory,
            children: {} // not an array
        };
        expect(() => validateRouteDef({ routeDef: route })).toThrow(/Children.*must be an array/);
    });
});
