import type {RouteDef} from "../../types/TRouteDef";
import express from "express";
import {createContext} from "../createContext";


describe('createContext', () => {
    it('should return an empty object if no inject is provided', () => {
        const def: RouteDef = {
            path: '/test',
            factory: () => express.Router()
        };
        expect(createContext({ routeDef: def})).toEqual({});
    });

    it('should return the inject object if provided', () => {
        const context = { myService: { doSomething: () => 'ok' } };
        const def: RouteDef = {
            path: '/test',
            inject: context,
            factory: () => require('express').Router()
        };
        expect(createContext({ routeDef: def})).toBe(context);
    });
});
