import {testHandler} from "../src";
import type { Request, Response, NextFunction } from 'express';
import { jest } from '@jest/globals';

test('testcrea works', () => {
    expect(true).toBe(true);
  });



describe('testHandler', () => {
    it('should call res.send', () => {
        const req = {} as Request;
        const res = { send: jest.fn() } as unknown as Response;
        const next = jest.fn() as NextFunction;

        testHandler(req, res, next);

        expect(res.send).toHaveBeenCalledWith('Hello from testcrea');
    });
});
