import type { Request, Response, NextFunction } from 'express';
import {withErrorHandler} from "../withErrorHandler.js";
import {jest } from '@jest/globals';

describe('withErrorHandler decorator', () => {
    let req: Partial<Request>;
    let res: Partial<Response>;
    let next: jest.Mock;

    beforeEach(() => {
        req = {};

        res = {
            status: jest.fn().mockImplementation(() => res) as any,
            json: jest.fn().mockImplementation(() => res) as any,
        };

        next = jest.fn();
    });

    it('should call the original method when no error is thrown', async () => {
        class TestController {
            @withErrorHandler
            async handler(req: Request, res: Response, next: NextFunction) {
                res.status(200).json({ ok: true });
            }
        }

        const controller = new TestController();
        await controller.handler(req as Request, res as Response, next);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({ ok: true });
        expect(next).not.toHaveBeenCalled();
    });

    it('should call next with error when an exception is thrown', async () => {
        const error = new Error('Test error');

        class TestController {
            @withErrorHandler
            async handler(req: Request, res: Response, next: NextFunction) {
                throw error;
            }
        }

        const controller = new TestController();
        await controller.handler(req as Request, res as Response, next);

        expect(next).toHaveBeenCalledWith(error);
    });
});
